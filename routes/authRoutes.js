const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const bcrypt = require('bcryptjs');
const oauth2Client = require('../config/ggAuth');
const userModel = require('../models/userCheck');

// Route hiển thị trang đăng nhập/đăng ký
router.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    res.render('login', {
        layout: false,
        title: 'Đăng nhập',
        css: 'login',
        js: 'login',
        isRegistering: req.query.action === 'register'
    });
});

// Route xử lý đăng ký
router.post('/register', async (req, res) => {
    const { email, account, displayName, password, confirmPassword, agreeTerms } = req.body;
    const db = req.db;

    // Chuẩn bị formData để gửi lại nếu có lỗi
    const formData = {
        email: email,
        account: account,
        displayName: displayName,
    };

    if (!email || !account || !displayName || !password || !confirmPassword) {
        return res.render('login', {
            layout: false, title: 'Đăng ký', css: 'login', js: 'login', isRegistering: true,
            errorMessage: 'Vui lòng điền đầy đủ các trường bắt buộc.',
            formData: formData // << Gửi lại formData
        });
    }
    if (password !== confirmPassword) {
        return res.render('login', {
            layout: false, title: 'Đăng ký', css: 'login', js: 'login', isRegistering: true,
            errorMessage: 'Mật khẩu và xác nhận mật khẩu không khớp.',
            formData: formData // << Gửi lại formData
        });
    }
    if (!agreeTerms) {
        return res.render('login', {
            layout: false, title: 'Đăng ký', css: 'login', js: 'login', isRegistering: true,
            errorMessage: 'Bạn phải đồng ý với chính sách bảo mật.',
            formData: formData // << Gửi lại formData
        });
    }

    try {
        const existingUser = await userModel.findUserByEmail(db, email);
        if (existingUser) {
            return res.render('login', {
                layout: false, title: 'Đăng ký', css: 'login', js: 'login', isRegistering: true,
                errorMessage: 'Email này đã được sử dụng để đăng ký.',
                formData: formData // << Gửi lại formData
            });
        }
        const existingAccount = await userModel.findUserByAccount(db, account);
        if (existingAccount) {
            return res.render('login', {
                layout: false, title: 'Đăng ký', css: 'login', js: 'login', isRegistering: true,
                errorMessage: 'Tài khoản này đã tồn tại. Vui lòng chọn tài khoản khác.',
                formData: formData // << Gửi lại formData
            });
        }

        // Hash mật khẩu
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const currentDate = new Date().toISOString().slice(0, 10);

        // Lưu người dùng mới
        const newUser = {
            email: email,
            account: account,
            username: displayName, // Tên hiển thị
            password: hashedPassword,
            time_create: currentDate,
            google_id: null // Không phải đăng ký qua Google
        };

        await userModel.createUser(db, newUser);

        console.log('Người dùng mới (truyền thống) đã được thêm:', newUser.username);

        // Tạo session và đăng nhập luôn (tùy chọn)
        req.session.user = {
            userId: newUser.email, // Sử dụng email làm userId trong session
            username: newUser.username
        };
        req.session.save(err => {
            if (err) {
                console.error("Lỗi khi lưu session sau khi đăng ký:", err);
                // Vẫn có thể redirect nhưng không có session
                return res.redirect('/login?registration_error=session_save');
            }
            res.redirect('/'); // Chuyển hướng về trang chủ sau khi đăng ký thành công
        });

    } catch (error) {
        console.error('Lỗi trong quá trình đăng ký:', error);
        res.render('login', {
            layout: false, title: 'Đăng ký', css: 'login', js: 'login', isRegistering: true,
            errorMessage: 'Đã xảy ra lỗi trong quá trình đăng ký. Vui lòng thử lại.'
        });
    }
});

// Route xử lý đăng nhập
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const db = req.db;

    // Chuẩn bị formData để gửi lại nếu có lỗi
    const formData = {
        email: email
        // Không gửi lại password
    };

    if (!email || !password) {
        return res.render('login', {
            layout: false, title: 'Đăng nhập', css: 'login', js: 'login', isRegistering: false, // Đảm bảo isRegistering là false
            errorMessage: 'Vui lòng nhập email/tài khoản và mật khẩu.',
            formData: formData // << Gửi lại formData
        });
    }

    try {
        let userfind;
        if (email.includes('@')) {
            userfind = await userModel.findUserDetailsByEmail(db, email);
        } else {
            userfind = await userModel.findUserByAccount(db, email);
        }

        if (!userfind) {
            return res.render('login', {
                layout: false, title: 'Đăng nhập', css: 'login', js: 'login', isRegistering: false,
                errorMessage: 'Email/tài khoản hoặc mật khẩu không chính xác.',
                formData: formData // << Gửi lại formData
            });
        }

        const match = await bcrypt.compare(password, userfind.password);

        if (match) {
            req.session.user = {
                userId: userfind.email,
                username: userfind.username
            };
            // Lấy roadmap từ user_course và lưu vào session (dùng model)
            const roadmap = await userModel.getUserRoadmap(db, userfind.email);
            if (roadmap) {
                req.session.roadmap = roadmap;
            }
            req.session.save(err => {
                if (err) {
                    console.error("Lỗi khi lưu session:", err);
                    return res.redirect('/login?error=session_save_error');
                }
                res.redirect('/');
            });
        } else {
            return res.render('login', {
                layout: false, title: 'Đăng nhập', css: 'login', js: 'login', isRegistering: false,
                errorMessage: 'Email/tài khoản hoặc mật khẩu không chính xác.',
                formData: formData // << Gửi lại formData
            });
        }
    } catch (error) {
        console.error('Lỗi trong quá trình đăng nhập:', error);
        res.render('login', {
            layout: false, title: 'Đăng nhập', css: 'login', js: 'login', isRegistering: false,
            errorMessage: 'Đã xảy ra lỗi. Vui lòng thử lại.',
            formData: formData // << Gửi lại formData
        });
    }
});

// Route xử lý xác thực Google
router.get('/auth/google', (req, res) => {
    const scope = [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
    ];
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scope,
        prompt: 'consent' // Yêu cầu sự đồng ý mỗi lần, hữu ích khi debug
    });
    res.redirect(authUrl);
});

// Route callback từ Google
router.get('/auth/google/callback', async (req, res) => {
    const code = req.query.code;
    const db = req.db;
    if (!code) {
        console.error("Không nhận được mã code từ Google.");
        return res.redirect('/login?error=google_auth_failed_no_code');
    }

    try {
        // Trao đổi 'code' để lấy 'tokens' (access_token, id_token, refresh_token)
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        console.log("Tokens nhận được từ Google:", tokens);

        // Sử dụng access_token để lấy thông tin người dùng từ Google People API
        const people = google.people({ version: 'v1', auth: oauth2Client });
        const profileInfo = await people.people.get({
            resourceName: 'people/me',
            personFields: 'names,emailAddresses,metadata', // Lấy tên, email, ảnh
        });

        const emailFromGoogle = profileInfo.data.emailAddresses && profileInfo.data.emailAddresses.length > 0
            ? profileInfo.data.emailAddresses[0].value
            : null;
        const nameFromGoogle = profileInfo.data.names && profileInfo.data.names.length > 0
            ? profileInfo.data.names[0].displayName
            : "Người dùng HocAI"; // Fallback nếu không có tên

        // Lấy Google ID từ metadata
        const googleId = profileInfo.data.metadata && profileInfo.data.metadata.sources && profileInfo.data.metadata.sources.length > 0
            ? profileInfo.data.metadata.sources.find(s => s.type === 'PROFILE')?.id || profileInfo.data.metadata.sources[0].id
            : null;

        console.log("--- Thông tin người dùng từ Google ---");
        console.log("Email:", emailFromGoogle);
        console.log("Tên hiển thị:", nameFromGoogle);
        console.log("Google ID:", googleId);
        console.log("------------------------------------");

        let userRecordForSession;
        let existingUser = await userModel.findUserDetailsByEmail(db, emailFromGoogle);

        if (existingUser) {
            userRecordForSession = { email: existingUser.email, username: existingUser.username };
            if (googleId && !existingUser.google_id) {
                await userModel.updateUserGoogleId(db, emailFromGoogle, googleId); // Cập nhật google_id
            }
        } else {
            console.log(`Email ${emailFromGoogle} chưa tồn tại. Tạo người dùng mới.`);
            const username = nameFromGoogle;
            const randomPassword = global.generateRandomPassword(); // Hàm này đã được định nghĩa global trong server.js

            // hash mật khẩu
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(randomPassword, saltRounds);
            const passwordToStore = hashedPassword;

            const currentDate = new Date().toISOString().slice(0, 10); // Lấy YYYY-MM-DD

            const newUser = {
                email: emailFromGoogle,
                account: null,
                username: username,
                password: passwordToStore,
                time_create: currentDate,
                google_id: googleId
            };

            await userModel.createUser(db, newUser);
            console.log('Người dùng mới đã được thêm vào cơ sở dữ liệu:', newUser.username);
            userRecordForSession = { email: emailFromGoogle, username: username, account: null };

        }
        // Lưu thông tin người dùng vào session
        req.session.user = {
            userId: userRecordForSession.email,
            username: userRecordForSession.username
        };
        // Lấy roadmap từ user_course và lưu vào session (dùng model)
        const roadmap = await userModel.getUserRoadmap(db, userRecordForSession.email);
        if (roadmap) {
            req.session.roadmap = roadmap;
        }
        console.log('Session created/updated:', req.session);

        req.session.save(err => {
            if (err) {
                console.error("Lỗi khi lưu session:", err);
                return res.redirect('/login?error=session_save_error');
            }
            res.redirect('/');
        });


    } catch (error) {
        console.error('Lỗi trong Google OAuth callback:', error.message);
        if (error.response && error.response.data) {
            console.error('Chi tiết lỗi từ Google:', error.response.data);
        }
        res.redirect('/login?error=google_auth_failed');
    }
});

// Route lấy thông tin người dùng hiện tại
router.get('/api/user/current', async (req, res) => {
    if (req.session && req.session.user && req.session.user.userId) {
        try {
            const user = await userModel.findUserDetailsByEmail(req.db, req.session.user.userId);
            if (user) {
                return res.json({
                    username: user.username,
                    email: user.email,
                    account: user.account,
                    time_create: user.time_create.toLocaleString("vi-VN", {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    }),
                    roadmap: user.roadmap
                });
            } else {
                req.session.destroy(); // Xóa session hỏng
                return res.status(401).json({ message: 'Người dùng không hợp lệ' });
            }
        } catch (dbError) {
            console.error("Lỗi lấy user từ DB cho session:", dbError);
            return res.status(500).json({ message: "Lỗi máy chủ" });
        }
    } else {
        res.status(401).json({ message: 'Chưa đăng nhập' });
    }
});

// Route đăng xuất
router.post('/logout', (req, res, next) => { // Sử dụng POST
    if (req.session) {
        // Hủy session
        req.session.destroy(err => {
            if (err) {
                // Xử lý lỗi nếu không hủy được session
                console.error("Lỗi khi hủy session:", err);
                // Bạn có thể muốn gửi một trang lỗi hoặc thông báo
                return res.status(500).send("Không thể đăng xuất, vui lòng thử lại.");
            }

            res.clearCookie(process.env.SESSION_COOKIE_NAME || 'connect.sid'); // Nên đặt tên cookie session vào .env
            console.log("Người dùng đã đăng xuất, session đã được hủy.");
            res.redirect('/');
        });
    } else {
        // Không có session, chỉ chuyển hướng về trang chủ
        res.redirect('/');
    }
});

// API lấy danh sách khoá học và bài học đang học của user
router.get('/api/user/courses', async (req, res) => {
    if (!req.session || !req.session.user || !req.session.user.userId) {
        return res.status(401).json({ message: 'Chưa đăng nhập' });
    }
    try {
        const db = req.db;
        const email = req.session.user.userId;
        const courses = await userModel.getUserCoursesProgress(db, email);
        res.json({ courses });
    } catch (err) {
        console.error('Lỗi lấy danh sách khoá học:', err);
        res.status(500).json({ message: 'Lỗi máy chủ' });
    }
});

module.exports = router; 