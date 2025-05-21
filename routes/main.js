const express = require('express');
const router = express.Router();
const CourseController = require('../controllers/courseController');

// Khởi tạo controller với middleware
router.use((req, res, next) => {
    req.courseController = new CourseController(req.db);
    next();
});

// Chuyển hướng các trang
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

// Routes cho khóa học
router.get('/tranghoc', (req, res) => req.courseController.getCoursePage(req, res));
router.post('/register-course', (req, res) => req.courseController.registerCourse(req, res));
router.get('/lesson-content', (req, res) => req.courseController.getLessonContent(req, res));
router.get('/lesson-quizz', (req, res) => req.courseController.getLessonQuizz(req, res));
router.post('/update-roadmap', (req, res) => req.courseController.updateRoadmap(req, res));

module.exports = router;