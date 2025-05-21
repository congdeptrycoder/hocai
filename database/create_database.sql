-- Create database
CREATE DATABASE IF NOT EXISTS hocai_schema;
USE hocai_schema;

-- Create chapter_list table
CREATE TABLE IF NOT EXISTS chapter_list (
    id_chapter VARCHAR(45) NOT NULL,
    id_course VARCHAR(45) NOT NULL,
    name_chapter TEXT NOT NULL,
    PRIMARY KEY (id_chapter, id_course)
);

-- Create course_list table
CREATE TABLE IF NOT EXISTS course_list (
    id_course VARCHAR(45) NOT NULL,
    name_course TEXT NOT NULL,
    url TEXT,
    content MEDIUMTEXT,
    PRIMARY KEY (id_course)
);

-- Create lesson_content table
CREATE TABLE IF NOT EXISTS lesson_content (
    id_lesson VARCHAR(45) NOT NULL,
    id_course VARCHAR(45) NOT NULL,
    id_chapter VARCHAR(20) NOT NULL,
    review MEDIUMTEXT,
    content MEDIUMTEXT,
    url TEXT,
    PRIMARY KEY (id_lesson, id_course, id_chapter)
);

-- Create lesson_name table
CREATE TABLE IF NOT EXISTS lesson_name (
    id_lesson VARCHAR(45) NOT NULL,
    id_course VARCHAR(45) NOT NULL,
    id_chapter VARCHAR(20) NOT NULL,
    name_lesson TEXT NOT NULL,
    PRIMARY KEY (id_lesson, id_course, id_chapter)
);

-- Create lesson_quizz table
CREATE TABLE IF NOT EXISTS lesson_quizz (
    id_lesson VARCHAR(45) NOT NULL,
    id_course VARCHAR(45) NOT NULL,
    id_chapter VARCHAR(20) NOT NULL,
    id_quizz INT NOT NULL,
    question TEXT NOT NULL,
    type TEXT NOT NULL,
    PRIMARY KEY (id_lesson, id_course, id_chapter, id_quizz)
);

-- Create quizz_answer table
CREATE TABLE IF NOT EXISTS quizz_answer (
    id_quizz INT NOT NULL,
    id_answer INT NOT NULL,
    content TEXT NOT NULL,
    istrue INT NOT NULL,
    PRIMARY KEY (id_quizz, id_answer)
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
    session_id VARCHAR(128) NOT NULL,
    expires INT UNSIGNED NOT NULL,
    data MEDIUMTEXT,
    PRIMARY KEY (session_id)
);

-- Create user_course table
CREATE TABLE IF NOT EXISTS user_course (
    email VARCHAR(100) NOT NULL,
    roadmap VARCHAR(255),
    PRIMARY KEY (email)
);

-- Create user_data table
CREATE TABLE IF NOT EXISTS user_data (
    email VARCHAR(100) NOT NULL,
    account VARCHAR(45) UNIQUE,
    username TINYTEXT NOT NULL,
    password VARCHAR(255) NOT NULL,
    time_create DATE NOT NULL DEFAULT (CURRENT_DATE),
    google_id VARCHAR(255) UNIQUE,
    role VARCHAR(45) NOT NULL DEFAULT 'user',
    PRIMARY KEY (email)
);

-- Add foreign key constraints
ALTER TABLE chapter_list
ADD CONSTRAINT fk_chapter_course
FOREIGN KEY (id_course) REFERENCES course_list(id_course);

ALTER TABLE lesson_content
ADD CONSTRAINT fk_lesson_content_chapter
FOREIGN KEY (id_chapter, id_course) REFERENCES chapter_list(id_chapter, id_course);

ALTER TABLE lesson_name
ADD CONSTRAINT fk_lesson_name_chapter
FOREIGN KEY (id_chapter, id_course) REFERENCES chapter_list(id_chapter, id_course);

ALTER TABLE lesson_quizz
ADD CONSTRAINT fk_lesson_quizz_chapter
FOREIGN KEY (id_chapter, id_course) REFERENCES chapter_list(id_chapter, id_course);

ALTER TABLE quizz_answer
ADD CONSTRAINT fk_quizz_answer_lesson
FOREIGN KEY (id_quizz) REFERENCES lesson_quizz(id_quizz);

ALTER TABLE user_course
ADD CONSTRAINT fk_user_course_data
FOREIGN KEY (email) REFERENCES user_data(email); 