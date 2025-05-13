// Hàm check người dùng đã tồn tại hay chưa
async function findUserByEmail(db, email) {
    const [users] = await db.query('SELECT * FROM user_data WHERE email = ?', [email]);
    return users.length > 0 ? users[0] : null;
}

// Hàm lấy thông tin người dùng
async function findUserDetailsByEmail(db, email) {
    const [users] = await db.query(
        'SELECT u.email, u.username, u.account, u.time_create, u.password, u.google_id, c.roadmap ' +
        'FROM user_data u LEFT JOIN user_course c ON u.email = c.email WHERE u.email = ?',
        [email]
    );
    return users.length > 0 ? users[0] : null;
}

// Hàm tạo người dùng mới
async function createUser(db, userData) {
    const { email, account, username, password, time_create, google_id } = userData;
    const [result] = await db.query(
        'INSERT INTO user_data (email, account, username, password, time_create, google_id) VALUES (?, ?, ?, ?, ?, ?)',
        [email, account, username, password, time_create, google_id]
    );
    await db.query(
        'INSERT INTO user_course (email, roadmap) VALUES (?, ?)',
        [email, 'cb0kh0gm0']
    );
    return result.insertId;
}

// Hàm cập nhật Google ID cho người dùng chưa có
async function updateUserGoogleId(db, email, googleId) {
    await db.query('UPDATE user_data SET google_id = ? WHERE email = ?', [googleId, email]);
}

// Hàm check người dùng bằng account
async function findUserByAccount(db, account) {
    const [users] = await db.query('SELECT * FROM user_data WHERE account = ?', [account]);
    return users.length > 0 ? users[0] : null;
}

module.exports = {
    findUserByEmail,
    findUserDetailsByEmail,
    createUser,
    updateUserGoogleId,
    findUserByAccount,
};