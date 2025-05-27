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
// --- Cấu hình Session Store với MySQL ---
const sessionStoreOptions = {
    host: dbConfig.HOST,
    port: dbConfig.PORT,
    user: dbConfig.USER,
    password: dbConfig.PASSWORD,
    database: dbConfig.DB,
    clearExpired: true, // Tự động xóa các session đã hết hạn
    checkExpirationInterval: 900000, // Tần suất kiểm tra session hết hạn (ví dụ: 15 phút)
    expiration: 24 * 60 * 60 * 1000, // Thời gian sống của session (ví dụ: 1 ngày), giống maxAge của cookie
    createDatabaseTable: true, // Tự động tạo bảng 'sessions' nếu chưa có
    schema: {
        tableName: 'sessions', // Tên bảng để lưu session
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
    store: sessionStore, // <<< SỬ DỤNG MYSQL STORE
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // Phải khớp với 'expiration' của sessionStore
    }
}));
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
        connection.release(); // Trả connection về pool sau khi kiểm tra
    }
});
app.use((req, res, next) => {
    req.db = pool; // Gán pool vào req.db
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

app.use('/', mainRouter);
app.use('/', authRouter);
app.use('/chat', chatRouter);

global.generateRandomPassword = function () {
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
};

// Hàm để thực thi file SQL
async function executeSqlFile(filePath) {
    try {
        const sql = fs.readFileSync(filePath, 'utf8');
        const connection = await pool.getConnection();
        try {
            // Tách các câu lệnh SQL và thực thi từng câu
            const statements = sql.split(';').filter(statement => statement.trim());
            for (const statement of statements) {
                if (statement.trim()) {
                    await connection.query(statement);
                }
            }
            console.log('Đã thực thi thành công file SQL:', filePath);
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Lỗi khi thực thi file SQL:', error);
    }
}

app.listen(port, async () => {
    console.log(`Server đang chạy tại http://localhost:${port}`);
    // Thực thi file create_database.sql khi server khởi động
    await executeSqlFile(path.join(__dirname, 'database', 'create_database.sql'));
});