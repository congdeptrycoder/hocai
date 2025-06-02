require('dotenv').config();
const express = require('express');
const { engine } = require('express-handlebars');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const path = require('path');
const fs = require('fs');
const mainRouter = require('./routes/main');
const authRouter = require('./routes/authRoutes');
const mysql = require('mysql2/promise');
const dbConfig = require('./config/db');
const chatRouter = require('./routes/chat');
const adminCoursesRouter = require('./routes/adminCourses');

const app = express();
const port = 3000;

// Kiểm tra kết nối cơ sở dữ liệu
const pool = mysql.createPool({
    host: dbConfig.HOST,
    user: dbConfig.USER,
    password: dbConfig.PASSWORD,
    database: dbConfig.DB,
    port: dbConfig.PORT,
    waitForConnections: true,
    connectionLimit: dbConfig.pool.max,
    queueLimit: 0
});
//Lưu phiên đăng nhập vào database
const sessionStoreOptions = {
    host: dbConfig.HOST,
    port: dbConfig.PORT,
    user: dbConfig.USER,
    password: dbConfig.PASSWORD,
    database: dbConfig.DB,
    clearExpired: true, 
    checkExpirationInterval: 900000, 
    expiration: 24 * 60 * 60 * 1000, 
    createDatabaseTable: true, 
    schema: {
        tableName: 'sessions', 
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
        }
    }
};
const sessionStore = new MySQLStore(sessionStoreOptions);
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_super_secret_key_hocai_db_session',
    store: sessionStore, 
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 
    }
}));
//Kiểm tra kết nối đến database
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Lỗi kết nối đến MySQL:', err.stack);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was closed.');
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database has too many connections.');
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('Database connection was refused.');
        }
        return;
    }
    if (connection) {
        console.log('Đã kết nối thành công đến MySQL với ID ' + connection.threadId);
        connection.release(); 
    }
});
app.use((req, res, next) => {
    req.db = pool; 
    next();
});
app.engine('hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: path.join(__dirname, 'views/partials')
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middleware ghi log mọi HTTP request vào file logs/access.log.
// Mỗi dòng log gồm: thời gian, phương thức, URL, mã trạng thái, địa chỉ IP, user-agent.
const logsDir = path.join(__dirname, 'logs');
const accessLogPath = path.join(logsDir, 'access.log');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const logLine = `${new Date().toISOString()} ${req.method} ${req.originalUrl} ${res.statusCode} ${req.ip} ${req.headers['user-agent'] || ''} ${Date.now() - start}ms\n`;
        fs.appendFile(accessLogPath, logLine, err => {
            if (err) console.error('Ghi log thất bại:', err);
        });
    });
    next();
});

app.use('/', mainRouter);
app.use('/', authRouter);
app.use('/chat', chatRouter);
app.use('/admin', adminCoursesRouter);

// Middleware ghi log lỗi vào file logs/error.log.
// Mỗi dòng log gồm: thời gian, phương thức, URL, mã trạng thái, địa chỉ IP, user-agent, thông báo lỗi, stack trace (nếu có).
const errorLogPath = path.join(logsDir, 'error.log');
app.use((err, req, res, next) => {
    const logLine = `${new Date().toISOString()} ${req.method} ${req.originalUrl} ${res.statusCode} ${req.ip} ${req.headers['user-agent'] || ''} ${err.message} ${err.stack || ''}\n`;
    fs.appendFile(errorLogPath, logLine, error => {
        if (error) console.error('Ghi log lỗi thất bại:', error);
    });
    next(err);
});

app.listen(port, async () => {
    console.log(`Server đang chạy tại http://localhost:${port}`);
});