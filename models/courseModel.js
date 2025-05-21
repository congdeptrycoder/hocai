const mysql = require('mysql2/promise');

class CourseModel {
    constructor(db) {
        this.db = db;
    }

    async getUserRoadmap(email) {
        const [userCourse] = await this.db.query('SELECT roadmap FROM user_course WHERE email = ?', [email]);
        return userCourse.length > 0 ? userCourse[0].roadmap : null;
    }

    async getCourseInfo(id_course) {
        const [courseRows] = await this.db.query('SELECT name_course, url, content FROM course_list WHERE id_course = ?', [id_course]);
        return courseRows.length > 0 ? courseRows[0] : null;
    }

    async getChapters(id_course) {
        const [chapters] = await this.db.query(
            'SELECT id_chapter, name_chapter FROM chapter_list WHERE id_course = ? ORDER BY id_chapter ASC',
            [id_course]
        );
        return chapters;
    }

    async getLessons(id_course, id_chapter) {
        const [lessons] = await this.db.query(
            'SELECT id_lesson, name_lesson FROM lesson_name WHERE id_course = ? AND id_chapter = ? ORDER BY id_lesson ASC',
            [id_course, id_chapter]
        );
        return lessons;
    }

    async getLessonContent(id_course, id_chapter, id_lesson) {
        const [contentRows] = await this.db.query(
            'SELECT content, url, review FROM lesson_content WHERE id_course = ? AND id_chapter = ? AND id_lesson = ?',
            [id_course, id_chapter, id_lesson]
        );
        return contentRows.length > 0 ? contentRows[0] : null;
    }

    async getLessonQuizz(id_course, id_chapter, id_lesson) {
        const [quizzRows] = await this.db.query(
            'SELECT id_quizz, question, type FROM lesson_quizz WHERE id_course = ? AND id_chapter = ? AND id_lesson = ? ORDER BY id_quizz ASC',
            [id_course, id_chapter, id_lesson]
        );

        for (const quizz of quizzRows) {
            const [answers] = await this.db.query(
                'SELECT id_answer, content, istrue FROM quizz_answer WHERE id_quizz = ? ORDER BY id_answer ASC',
                [quizz.id_quizz]
            );
            quizz.answers = answers;
        }

        return quizzRows;
    }

    async updateRoadmap(email, roadmap) {
        await this.db.query('UPDATE user_course SET roadmap = ? WHERE email = ?', [roadmap, email]);
    }
}

module.exports = CourseModel; 