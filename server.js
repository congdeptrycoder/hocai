const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');
const mainRouter = require('./routes/main');

const app = express();
const port = 3000;

app.engine('hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: path.join(__dirname, 'views/partials')
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/', mainRouter);
app.get('/', (req, res) => {
    res.render('index', { title: 'hocAI - Hướng dẫn giáo viên sử dụng công cụ AI', css: 'index', js: 'index' });
});

app.get('/gioithieu', (req, res) => {
    res.render('gioithieu', { title: 'Giới Thiệu Hoc AI', css: 'gioithieu', });
});

app.get('/csbm', (req, res) => {
    res.render('csbm', { title: 'Chính sách bảo mật', css: 'chinhsachbaomat', });
});

app.get('/tuyendung', (req, res) => {
    res.render('tuyendung', { title: 'Tuyển dụng Hoc AI', css: 'tuyendung', });
});

app.get('/donggop', (req, res) => {
    res.render('donggop', {
        title: 'Đóng góp Hoc AI', css: 'donggop'
    });
});

app.get('/login', (req, res) => {
    res.render('login', { layout: false, title: 'Đăng nhập', css: 'login', js: 'login' }); // Ví dụ: render không dùng layout chính
});

app.get('/tranghoc', (req, res) => {
    res.render('tranghoc', { title: 'Khóa học AI - hocAI', css: 'tranghoc', js: 'tranghoc' }); // Truyền title
});

app.listen(port, () => {
    console.log(`Server đang chạy tại http://localhost:${port}`);
});