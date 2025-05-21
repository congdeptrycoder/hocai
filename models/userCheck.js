// Hàm check người dùng đã tồn tại hay chưa
async function findUserByEmail(db, email) {
    const [users] = await db.query('SELECT * FROM user_data WHERE email = ?', [email]);
    return users.length > 0 ? users[0] : null;
}

// Hàm lấy thông tin người dùng
async function findUserDetailsByEmail(db, email) {
    const [users] = await db.query(
        'SELECT u.email, u.username, u.account, u.time_create, u.password, u.google_id, u.role, c.roadmap ' +
        'FROM user_data u LEFT JOIN user_course c ON u.email = c.email WHERE u.email = ?',
        [email]
    );
    return users.length > 0 ? users[0] : null;
}

// Hàm tạo người dùng mới
async function createUser(db, userData) {
    const { email, account, username, password, time_create, google_id } = userData;
    const [result] = await db.query(
        'INSERT INTO user_data (email, account, username, password, time_create, google_id, role) VALUES (?, ?, ?, ?, ?, ?, "user")',
        [email, account, username, password, time_create, google_id]
    );
    await db.query(
        'INSERT INTO user_course (email, roadmap) VALUES (?, ?)',
        [email, 'cbai0cbaikh0khgm0gm']
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

// Lấy roadmap của user
async function getUserRoadmap(db, email) {
    const [rows] = await db.query('SELECT roadmap FROM user_course WHERE email = ?', [email]);
    return rows.length > 0 ? rows[0].roadmap : null;
}

// Lấy danh sách khoá học và bài học đang học của user
async function getUserCoursesProgress(db, email) {
    // Lấy roadmap tổng
    const [roadmapRows] = await db.query('SELECT roadmap FROM user_course WHERE email = ?', [email]);
    if (!roadmapRows.length) return [];
    const roadmapStr = roadmapRows[0].roadmap;
    // Lấy danh sách khoá học
    const [courses] = await db.query('SELECT id_course, name_course FROM course_list');
    const result = [];
    for (const course of courses) {
        const tag = course.id_course;
        const firstIdx = roadmapStr.indexOf(tag);
        if (firstIdx === -1) continue;
        const secondIdx = roadmapStr.indexOf(tag, firstIdx + tag.length);
        if (secondIdx === -1) continue;
        const courseRoadmap = roadmapStr.substring(firstIdx + tag.length, secondIdx);
        const lessonIndex = parseInt(courseRoadmap);
        if (!lessonIndex || lessonIndex === 0) continue;
        // Lấy name_lesson đang học
        const [lessonRows] = await db.query(
            'SELECT name_lesson FROM lesson_name WHERE id_course = ? ORDER BY id_lesson ASC',
            [tag]
        );
        let lessonName = '';
        if (lessonRows.length >= lessonIndex) {
            lessonName = lessonRows[lessonIndex - 1].name_lesson;
        }
        result.push({
            id_course: tag,
            name_course: course.name_course,
            lesson: lessonName
        });
    }
    return result;
}

module.exports = {
    findUserByEmail,
    findUserDetailsByEmail,
    createUser,
    updateUserGoogleId,
    findUserByAccount,
    getUserRoadmap,
    getUserCoursesProgress,
};