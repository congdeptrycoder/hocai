const express = require('express');
const router = express.Router();

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

router.get('/tranghoc', (req, res) => {
    res.render('tranghoc', { title: 'Khóa học AI - hocAI', css: 'tranghoc', js: 'tranghoc' });
});

module.exports = router;