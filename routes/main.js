const express = require('express');
const router = express.Router();
const CourseController = require('../controllers/courseController');

// Khởi tạo controller với middleware
router.use((req, res, next) => {
    req.courseController = new CourseController(req.db);
    next();
});

// Route chuyển hướng trang chủ
router.get('/', (req, res) => {
    res.render('index', { title: 'hocAI - Hướng dẫn giáo viên sử dụng công cụ AI', css: 'index', js: 'index' });
});
// Route chuyển hướng giới thiệu
router.get('/gioithieu', (req, res) => {
    res.render('gioithieu', { title: 'Giới Thiệu Hoc AI', css: 'gioithieu' });
});
// Route chuyển hướng trang chính sách bảo mật
router.get('/csbm', (req, res) => {
    res.render('csbm', { title: 'Chính sách bảo mật', css: 'chinhsachbaomat' });
});
// Route chuyển hướng trang tuyển dụng
router.get('/tuyendung', (req, res) => {
    res.render('tuyendung', { title: 'Tuyển dụng Hoc AI', css: 'tuyendung' });
});
// Route chuyển hướng trang đóng góp
router.get('/donggop', (req, res) => {
    res.render('donggop', { title: 'Đóng góp Hoc AI', css: 'donggop' });
});

// Routes cho khóa học
router.get('/tranghoc', (req, res) => req.courseController.getCoursePage(req, res));
router.post('/register-course', (req, res) => req.courseController.registerCourse(req, res));
router.get('/lesson-content', (req, res) => req.courseController.getLessonContent(req, res));
router.get('/lesson-quizz', (req, res) => req.courseController.getLessonQuizz(req, res));
router.post('/update-roadmap', (req, res) => req.courseController.updateRoadmap(req, res));

module.exports = router;