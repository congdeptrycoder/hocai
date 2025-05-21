const showAdminDashboard = (req, res) => {
    // Check if user is logged in and has admin role
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ 
            error: 'Bạn không có quyền admin',
            redirect: '/'
        });
    }

    res.render('admin', {
        layout: false,
        title: 'Admin Dashboard',
        user: {
            username: req.session.user.username
        }
    });
};

module.exports = {
    showAdminDashboard
}; 