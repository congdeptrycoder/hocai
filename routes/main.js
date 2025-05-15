const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const userModel = require('./../models/userCheck');

//Chuyển hướng các trang
router.get('/', (req, res) => {
    res.render('index', { title: 'hocAI - Hướng dẫn giáo viên sử dụng công cụ AI', css: 'index', js: 'index' });
});

router.get('/gioithieu', (req, res) => {
    res.render('gioithieu', { title: 'Giới Thiệu Hoc AI', css: 'gioithieu' });
});

router.get('/csbm', (req, res) => {
    res.render('csbm', { title: 'Chính sách bảo mật', css: 'chinhsachbaomat' });
});

router.get('/tuyendung', (req, res) => {
    res.render('tuyendung', { title: 'Tuyển dụng Hoc AI', css: 'tuyendung' });
});

router.get('/donggop', (req, res) => {
    res.render('donggop', { title: 'Đóng góp Hoc AI', css: 'donggop' });
});

router.get('/tranghoc', async (req, res) => {
    // Kiểm tra đăng nhập
    if (!req.session || !req.session.user || !req.session.user.userId) {
        return res.send(`<script>alert('Coming soon'); window.location.href = '/';</script>`);
    }
    const email = req.session.user.userId;
    const id_course = req.query.id_course;
    let courseRoadmap = '';
    if (!id_course) {
        return res.render('tranghoc', { title: 'Khóa học AI - hocAI', css: 'tranghoc', js: 'tranghoc' });
    }
    try {
        const db = req.db || req.app.get('db');
        // Lấy roadmap từ user_course
        const [userCourse] = await db.query('SELECT roadmap FROM user_course WHERE email = ?', [email]);
        if (userCourse.length > 0) {
            const roadmapStr = userCourse[0].roadmap;
            req.session.roadmap = roadmapStr; // Lưu roadmap vào session
            console.log('User roadmap:', roadmapStr);
            // Tách roadmap cho khoá học hiện tại

            const courseTag = id_course;
            const firstIdx = roadmapStr.indexOf(courseTag);
            if (firstIdx !== -1) {
                const secondIdx = roadmapStr.indexOf(courseTag, firstIdx + courseTag.length);
                if (secondIdx !== -1) {
                    courseRoadmap = roadmapStr.substring(firstIdx + courseTag.length, secondIdx);
                } else {
                    // Nếu chỉ có 1 lần xuất hiện, lấy từ sau tag đến hết chuỗi
                    courseRoadmap = roadmapStr.substring(firstIdx + courseTag.length);
                }
            }
            console.log(`Roadmap cho khoá học '${id_course}':`, courseRoadmap);
        } else {
            console.log('User roadmap: Không tìm thấy');
        }
        let currentLessonIndex = 0;
        if (courseRoadmap) {
            const num = parseInt(courseRoadmap);
            if (!isNaN(num)) currentLessonIndex = num;
        }
        // Nếu roadmap là 0 thì chuyển hướng sang trang giới thiệu khoá học
        if (currentLessonIndex === 0) {
            // Truy vấn tên khoá học
            const [courseRows] = await db.query('SELECT name_course, url, content FROM course_list WHERE id_course = ?', [id_course]);
            const courseName = courseRows.length > 0 ? courseRows[0].name_course : '';
            const courseUrl = courseRows.length > 0 ? courseRows[0].url : '';
            const courseContent = courseRows.length > 0 ? courseRows[0].content : '';
            return res.render('gioithieukhoahoc', {
                title: 'Giới thiệu khoá học',
                name_course: courseName,
                course_url: courseUrl,
                course_content: courseContent,
                css: 'gtkh',
                js: 'gtkh'
            });
        }
        // Lấy danh sách chương (id_chapter, name_chapter) theo thứ tự
        const [chapters] = await db.query(
            'SELECT id_chapter, name_chapter FROM chapter_list WHERE id_course = ? ORDER BY id_chapter ASC',
            [id_course]
        );
        // Lấy danh sách bài học cho từng chương theo thứ tự
        let chapterList = [];
        let i = 0;
        let lessonCounter = 0; // Đếm số thứ tự bài học toàn khoá
        for (const chapter of chapters) {
            i++;
            const [chapterLessons] = await db.query(
                'SELECT id_lesson, name_lesson FROM lesson_name WHERE id_course = ? AND id_chapter = ? ORDER BY id_lesson ASC',
                [id_course, chapter.id_chapter]
            );
            const lessons = chapterLessons.map((lesson, idx) => {
                lessonCounter++;
                return {
                    chapter: chapter.id_chapter,
                    id: lesson.id_lesson,
                    name: lesson.name_lesson,
                    stt: lessonCounter, // Thêm số thứ tự toàn cục
                    isUnlocked: (currentLessonIndex === 0) ? (lessonCounter === 1) : (lessonCounter <= currentLessonIndex),
                    isActive: lessonCounter === currentLessonIndex // Bài đang học
                };
            });
            chapterList.push({
                stt: i,
                name: chapter.name_chapter,
                lessons
            });
        }
        // In ra console để kiểm tra
        console.log('Chapters:', chapterList);
        // Render và truyền dữ liệu sang view
        res.render('tranghoc', {
            title: 'Khóa học AI - hocAI',
            css: 'tranghoc',
            js: 'tranghoc',
            course: { chapters: chapterList }
        });
    } catch (err) {
        console.error('Lỗi truy vấn CSDL:', err);
        res.status(500).send('Lỗi máy chủ');
    }
});

// Đăng ký khoá học: cập nhật roadmap lên 1
router.post('/register-course', async (req, res) => {
    if (!req.session || !req.session.user || !req.session.user.userId) {
        return res.json({ success: false, message: 'Bạn cần đăng nhập!' });
    }
    const email = req.session.user.userId;
    const { id_course } = req.body;
    if (!id_course) return res.json({ success: false, message: 'Thiếu id_course!' });
    try {
        const db = req.db || req.app.get('db');
        // Lấy roadmap hiện tại
        const [userCourse] = await db.query('SELECT roadmap FROM user_course WHERE email = ?', [email]);
        if (!userCourse.length) return res.json({ success: false, message: 'Không tìm thấy user!' });
        let roadmap = userCourse[0].roadmap;
        // Tìm vị trí tag khoá học
        const tag = id_course;
        const firstIdx = roadmap.indexOf(tag);
        const secondIdx = roadmap.indexOf(tag, firstIdx + tag.length);
        if (firstIdx === -1 || secondIdx === -1) return res.json({ success: false, message: 'Không tìm thấy roadmap khoá học!' });
        let courseRoadmap = roadmap.substring(firstIdx + tag.length, secondIdx);
        if (courseRoadmap === '0') {
            // Cập nhật thành 1
            roadmap = roadmap.substring(0, firstIdx + tag.length) + '1' + roadmap.substring(secondIdx);
            await db.query('UPDATE user_course SET roadmap = ? WHERE email = ?', [roadmap, email]);
        }
        return res.json({ success: true });
    } catch (err) {
        console.error('Lỗi cập nhật roadmap:', err);
        res.json({ success: false, message: 'Lỗi máy chủ!' });
    }
});

// Sửa API lấy nội dung bài học: nhận stt từ client, kiểm tra quyền truy cập bằng stt
router.get('/lesson-content', async (req, res) => {
    if (!req.session || !req.session.user || !req.session.user.userId) {
        return res.status(401).json({ success: false, message: 'Bạn cần đăng nhập!' });
    }
    const email = req.session.user.userId;
    const id_course = req.query.id_course;
    const id_chapter = req.query.id_chapter;
    const id_lesson = req.query.id_lesson;
    const stt = parseInt(req.query.stt);
    if (!id_course || !id_chapter || !id_lesson || !stt) {
        return res.status(400).json({ success: false, message: 'Thiếu tham số!' });
    }
    // Lấy roadmap từ session
    const roadmapStr = req.session.roadmap;
    if (!roadmapStr) return res.status(403).json({ success: false, message: 'Không tìm thấy roadmap!' });
    // Tách roadmap cho khoá học hiện tại
    let courseRoadmap = '';
    const courseTag = id_course;
    const firstIdx = roadmapStr.indexOf(courseTag);
    if (firstIdx !== -1) {
        const secondIdx = roadmapStr.indexOf(courseTag, firstIdx + courseTag.length);
        if (secondIdx !== -1) {
            courseRoadmap = roadmapStr.substring(firstIdx + courseTag.length, secondIdx);
        } else {
            courseRoadmap = roadmapStr.substring(firstIdx + courseTag.length);
        }
    }
    const currentLessonIndex = parseInt(courseRoadmap) || 0;
    if (stt > currentLessonIndex) {
        return res.status(403).json({ success: false, message: 'Bạn chưa được phép truy cập bài học này!' });
    }
    // Truy vấn nội dung bài học
    const db = req.db || req.app.get('db');
    const [contentRows] = await db.query('SELECT content, url, review FROM lesson_content WHERE id_course = ? AND id_chapter = ? AND id_lesson = ?', [id_course, id_chapter, id_lesson]);
    if (!contentRows.length) return res.status(404).json({ success: false, message: 'Không tìm thấy nội dung bài học!' });
    console.log('Nội dung bài học:', contentRows[0]);
    return res.json({ success: true, data: contentRows[0] });
});

// API lấy quizz cho bài học
router.get('/lesson-quizz', async (req, res) => {
    if (!req.session || !req.session.user || !req.session.user.userId) {
        return res.status(401).json({ success: false, message: 'Bạn cần đăng nhập!' });
    }
    const id_course = req.query.id_course;
    const id_chapter = req.query.id_chapter;
    const id_lesson = req.query.id_lesson;
    if (!id_course || !id_chapter || !id_lesson) {
        return res.status(400).json({ success: false, message: 'Thiếu tham số!' });
    }
    try {
        const db = req.db || req.app.get('db');
        // Lấy danh sách quizz cho bài học
        const [quizzRows] = await db.query(
            'SELECT id_quizz, question, type FROM lesson_quizz WHERE id_course = ? AND id_chapter = ? AND id_lesson = ? ORDER BY id_quizz ASC',
            [id_course, id_chapter, id_lesson]
        );
        // Lấy đáp án cho từng quizz
        for (const quizz of quizzRows) {
            const [answers] = await db.query(
                'SELECT id_answer, content, istrue FROM quizz_answer WHERE id_quizz = ? ORDER BY id_answer ASC',
                [quizz.id_quizz]
            );
            quizz.answers = answers;
        }
        console.log('Quizz data:', quizzRows);
        return res.json({ success: true, data: quizzRows });
    } catch (err) {
        console.error('Lỗi lấy quizz:', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ!' });
    }
});

// Cập nhật roadmap khi hoàn thành bài học
router.post('/update-roadmap', async (req, res) => {
    if (!req.session || !req.session.user || !req.session.user.userId) {
        return res.status(401).json({ success: false, message: 'Bạn cần đăng nhập!' });
    }
    const email = req.session.user.userId;
    const { id_course, stt } = req.body;
    if (!id_course || !stt) {
        return res.json({ success: false, message: 'Thiếu tham số!' });
    }
    try {
        const db = req.db || req.app.get('db');
        // Lấy roadmap hiện tại
        const [userCourse] = await db.query('SELECT roadmap FROM user_course WHERE email = ?', [email]);
        if (!userCourse.length) return res.json({ success: false, message: 'Không tìm thấy user!' });
        let roadmap = userCourse[0].roadmap;
        // Tìm vị trí tag khoá học
        const tag = id_course;
        const firstIdx = roadmap.indexOf(tag);
        const secondIdx = roadmap.indexOf(tag, firstIdx + tag.length);
        if (firstIdx === -1 || secondIdx === -1) return res.json({ success: false, message: 'Không tìm thấy roadmap khoá học!' });
        // Cập nhật số bài học đã hoàn thành
        roadmap = roadmap.substring(0, firstIdx + tag.length) + stt + roadmap.substring(secondIdx);
        await db.query('UPDATE user_course SET roadmap = ? WHERE email = ?', [roadmap, email]);
        req.session.roadmap = roadmap;
        return res.json({ success: true });
    } catch (err) {
        console.error('Lỗi cập nhật roadmap:', err);
        res.json({ success: false, message: 'Lỗi máy chủ!' });
    }
});

module.exports = router;