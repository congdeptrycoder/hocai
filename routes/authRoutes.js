const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const bcrypt = require('bcryptjs');
const oauth2Client = require('../config/ggAuth');
const userModel = require('../models/userCheck');
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');

// Route hiển thị trang đăng nhập/đăng ký
router.get('/login', authController.showLogin);

// Route xử lý đăng ký
router.post('/register', authController.register);

// Route xử lý đăng nhập
router.post('/login', authController.login);

// Route xử lý xác thực Google
router.get('/auth/google', authController.googleAuth);

// Route callback từ Google
router.get('/auth/google/callback', authController.googleCallback);

// Route lấy thông tin người dùng hiện tại
router.get('/api/user/current', authController.getCurrentUser);

// Route đăng xuất
router.post('/logout', authController.logout);

// API lấy danh sách khoá học và bài học đang học của user
router.get('/api/user/courses', authController.getUserCourses);

// Route admin dashboard
router.get('/admin', adminController.showAdminDashboard);

// Route POST /api/user/update
router.post('/api/user/update', authController.handleUpdateUserInfo);

module.exports = router; 