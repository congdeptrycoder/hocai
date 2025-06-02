const { google } = require('googleapis');
const bcrypt = require('bcryptjs');
const oauth2Client = require('../config/ggAuth');
const userModel = require('../models/userCheck');

const userCheck = require('../models/userCheck');

/**
 * Hiển thị trang đăng nhập/đăng ký
 * @param {Request} req
 * @param {Response} res
 */
const showLogin = (req, res) => {
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
};

/**
 * Xử lý đăng ký 
 * @param {Request} req
 * @param {Response} res
 */
const register = async (req, res) => {
    const { email, account, displayName, password, confirmPassword, agreeTerms } = req.body;
    const db = req.db;
    const formData = { email, account, displayName };
    if (!email || !account || !displayName || !password || !confirmPassword) {
        return res.render('login', {
            layout: false, title: 'Đăng ký', css: 'login', js: 'login', isRegistering: true,
            errorMessage: 'Vui lòng điền đầy đủ các trường bắt buộc.',
            formData
        });
    }
    if (password !== confirmPassword) {
        return res.render('login', {
            layout: false, title: 'Đăng ký', css: 'login', js: 'login', isRegistering: true,
            errorMessage: 'Mật khẩu và xác nhận mật khẩu không khớp.',
            formData
        });
    }
    if (!agreeTerms) {
        return res.render('login', {
            layout: false, title: 'Đăng ký', css: 'login', js: 'login', isRegistering: true,
            errorMessage: 'Bạn phải đồng ý với chính sách bảo mật.',
            formData
        });
    }
    try {
        const existingUser = await userModel.findUserByEmail(db, email);
        if (existingUser) {
            return res.render('login', {
                layout: false, title: 'Đăng ký', css: 'login', js: 'login', isRegistering: true,
                errorMessage: 'Email này đã được sử dụng để đăng ký.',
                formData
            });
        }
        const existingAccount = await userModel.findUserByAccount(db, account);
        if (existingAccount) {
            return res.render('login', {
                layout: false, title: 'Đăng ký', css: 'login', js: 'login', isRegistering: true,
                errorMessage: 'Tài khoản này đã tồn tại. Vui lòng chọn tài khoản khác.',
                formData
            });
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const currentDate = new Date().toISOString().slice(0, 10);
        const newUser = {
            email,
            account,
            username: displayName,
            password: hashedPassword,
            time_create: currentDate,
            google_id: null,
            role: 'user'
        };
        await userModel.createUser(db, newUser);
        req.session.user = {
            userId: newUser.email,
            username: newUser.username
        };
        req.session.save(err => {
            if (err) {
                console.error("Lỗi khi lưu session sau khi đăng ký:", err);
                return res.redirect('/login?registration_error=session_save');
            }
            res.redirect('/');
        });
    } catch (error) {
        console.error('Lỗi trong quá trình đăng ký:', error);
        res.render('login', {
            layout: false, title: 'Đăng ký', css: 'login', js: 'login', isRegistering: true,
            errorMessage: 'Đã xảy ra lỗi trong quá trình đăng ký. Vui lòng thử lại.'
        });
    }
};

/**
 * Xử lý đăng nhập 
 * @param {Request} req
 * @param {Response} res
 */
const login = async (req, res) => {
    const { email, password } = req.body;
    const db = req.db;
    const formData = { email };
    if (!email || !password) {
        return res.render('login', {
            layout: false, title: 'Đăng nhập', css: 'login', js: 'login', isRegistering: false,
            errorMessage: 'Vui lòng nhập email/tài khoản và mật khẩu.',
            formData
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
                formData
            });
        }
        const match = await bcrypt.compare(password, userfind.password);
        if (match) {
            req.session.user = {
                userId: userfind.email,
                username: userfind.username,
                role: userfind.role
            };
            const roadmap = await userModel.getUserRoadmap(db, userfind.email);
            if (roadmap) {
                req.session.roadmap = roadmap;
            }
            req.session.save(err => {
                if (err) {
                    console.error("Lỗi khi lưu session:", err);
                    return res.redirect('/login?error=session_save_error');
                }
                if (userfind.role === 'user') {
                    res.redirect('/');
                } else {
                    res.redirect('/admin');
                }
            });
        } else {
            return res.render('login', {
                layout: false, title: 'Đăng nhập', css: 'login', js: 'login', isRegistering: false,
                errorMessage: 'Email/tài khoản hoặc mật khẩu không chính xác.',
                formData
            });
        }
    } catch (error) {
        console.error('Lỗi trong quá trình đăng nhập:', error);
        res.render('login', {
            layout: false, title: 'Đăng nhập', css: 'login', js: 'login', isRegistering: false,
            errorMessage: 'Đã xảy ra lỗi trong quá trình đăng nhập. Vui lòng thử lại.',
            formData
        });
    }
};

/**
 * Chuyển hướng xác thực Google OAuth
 * @param {Request} req
 * @param {Response} res
 */
const googleAuth = (req, res) => {
    const scope = [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
    ];
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scope,
        prompt: 'consent'
    });
    res.redirect(authUrl);
};

/**
 * Xử lý callback từ Google OAuth ( nếu chưa có sẵn thì tự đăng ký )
 * @param {Request} req
 * @param {Response} res
 */
const googleCallback = async (req, res) => {
    const code = req.query.code;
    const db = req.db;
    if (!code) {
        console.error("Không nhận được mã code từ Google.");
        return res.redirect('/login?error=google_auth_failed_no_code');
    }
    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        const people = google.people({ version: 'v1', auth: oauth2Client });
        const profileInfo = await people.people.get({
            resourceName: 'people/me',
            personFields: 'names,emailAddresses,metadata',
        });
        const emailFromGoogle = profileInfo.data.emailAddresses && profileInfo.data.emailAddresses.length > 0
            ? profileInfo.data.emailAddresses[0].value
            : null;
        const nameFromGoogle = profileInfo.data.names && profileInfo.data.names.length > 0
            ? profileInfo.data.names[0].displayName
            : "Người dùng HocAI";
        const googleId = profileInfo.data.metadata && profileInfo.data.metadata.sources && profileInfo.data.metadata.sources.length > 0
            ? profileInfo.data.metadata.sources.find(s => s.type === 'PROFILE')?.id || profileInfo.data.metadata.sources[0].id
            : null;
        let userRecordForSession;
        let existingUser = await userModel.findUserDetailsByEmail(db, emailFromGoogle);
        if (existingUser) {
            userRecordForSession = { 
                email: existingUser.email, 
                username: existingUser.username,
                role: existingUser.role 
            };
            if (googleId && !existingUser.google_id) {
                await userModel.updateUserGoogleId(db, emailFromGoogle, googleId);
            }
        } else {
            const username = nameFromGoogle;
            const randomPassword = generateRandomPassword();
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(randomPassword, saltRounds);
            const currentDate = new Date().toISOString().slice(0, 10);
            const newUser = {
                email: emailFromGoogle,
                account: null,
                username: username,
                password: hashedPassword,
                time_create: currentDate,
                google_id: googleId,
                role: 'user'
            };
            await userModel.createUser(db, newUser);
            userRecordForSession = { 
                email: emailFromGoogle, 
                username: username, 
                account: null,
                role: 'user' 
            };
        }
        req.session.user = {
            userId: userRecordForSession.email,
            username: userRecordForSession.username,
            role: userRecordForSession.role
        };
        const roadmap = await userModel.getUserRoadmap(db, userRecordForSession.email);
        if (roadmap) {
            req.session.roadmap = roadmap;
        }
        req.session.save(err => {
            if (err) {
                console.error("Lỗi khi lưu session:", err);
                return res.redirect('/login?error=session_save_error');
            }
            if (userRecordForSession.role === 'user') {
                res.redirect('/');
            } else {
                res.redirect('/admin');
            }
        });
    } catch (error) {
        console.error('Lỗi trong Google OAuth callback:', error.message);
        if (error.response && error.response.data) {
            console.error('Chi tiết lỗi từ Google:', error.response.data);
        }
        res.redirect('/login?error=google_auth_failed');
    }
};

/**
 * Lấy thông tin người dùng 
 * @param {Request} req
 * @param {Response} res
 */
const getCurrentUser = async (req, res) => {
    if (req.session && req.session.user && req.session.user.userId) {
        try {
            const user = await userModel.findUserDetailsByEmail(req.db, req.session.user.userId);
            if (user) {
                return res.json({
                    username: user.username,
                    email: user.email,
                    account: user.account,
                    role: user.role,
                    time_create: user.time_create.toLocaleString("vi-VN", {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    }),
                    roadmap: user.roadmap
                });
            } else {
                req.session.destroy();
                return res.status(401).json({ message: 'Người dùng không hợp lệ' });
            }
        } catch (dbError) {
            console.error("Lỗi lấy user từ DB cho session:", dbError);
            return res.status(500).json({ message: "Lỗi máy chủ" });
        }
    } else {
        res.status(401).json({ message: 'Chưa đăng nhập' });
    }
};

/**
 * Đăng xuất người dùng
 * @param {Request} req
 * @param {Response} res
 * @param {function} next
 */
const logout = (req, res, next) => {
    if (req.session) {
        req.session.destroy(err => {
            if (err) {
                console.error("Lỗi khi hủy session:", err);
                return res.status(500).send("Không thể đăng xuất, vui lòng thử lại.");
            }
            res.clearCookie(process.env.SESSION_COOKIE_NAME || 'connect.sid');
            res.redirect('/');
        });
    } else {
        res.redirect('/');
    }
};

/**
 * Lấy danh sách khoá học của người dùng
 * @param {Request} req
 * @param {Response} res
 */
const getUserCourses = async (req, res) => {
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
};

/**
 * Cập nhật thông tin người dùng
 * @param {Request} req
 * @param {Response} res
 */
const handleUpdateUserInfo = async (req, res) => {
    const db = req.db;
    try {
        if (!req.session || !req.session.user) {
            return res.status(401).send('Chưa đăng nhập');
        }
        const oldEmail = req.session.user.userId;
        const { email, account, username, password } = req.body;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const accountRegex = /^[a-zA-Z0-9_]+$/;
        if (!email || !account || !username) {
            return res.status(400).send('Thiếu thông tin');
        }
        if (!emailRegex.test(email)) {
            return res.status(400).send('Email không hợp lệ');
        }
        if (!accountRegex.test(account)) {
            return res.status(400).send('Tài khoản chỉ được chứa chữ, số, dấu gạch dưới');
        }
        if (username.trim().length === 0) {
            return res.status(400).send('Tên người dùng không được để trống');
        }
        let hashedPassword = password;
        if (password && password.length > 0) {
            if (password.length < 6) {
                return res.status(400).send('Mật khẩu phải có ít nhất 6 ký tự');
            }
            const upperCaseRegex = /[A-Z]/;
            const numberRegex = /[0-9]/;
            const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
            if (!upperCaseRegex.test(password)) {
                return res.status(400).send('Mật khẩu phải chứa ít nhất 1 ký tự viết hoa');
            }
            if (!numberRegex.test(password)) {
                return res.status(400).send('Mật khẩu phải chứa ít nhất 1 số');
            }
            if (!specialCharRegex.test(password)) {
                return res.status(400).send('Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt');
            }
            const saltRounds = 10;
            hashedPassword = await bcrypt.hash(password, saltRounds);
        }
        await userCheck.updateUserInfo(db, oldEmail, { email, account, username, password: hashedPassword });
        if (oldEmail !== email) {
            req.session.user.userId = email;
        }
        req.session.user.account = account;
        req.session.user.username = username;
        res.json({ success: true });
    } catch (err) {
        console.error('Lỗi cập nhật user:', err);
        res.status(500).send('Lỗi server');
    }
};

/**
 * Tạo mật khẩu ngẫu nhiên 
 * @returns {string}
 */
function generateRandomPassword() {
    const numbers = '0123456789';
    const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    let password = '';
    for (let i = 0; i < 6; i++) {
        password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    for (let i = 0; i < 5; i++) {
        password += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));
    return password.split('').sort(() => 0.5 - Math.random()).join('');
}

module.exports = {
    showLogin,
    register,
    login,
    googleAuth,
    googleCallback,
    getCurrentUser,
    logout,
    getUserCourses,
    handleUpdateUserInfo,
    generateRandomPassword 
}; 