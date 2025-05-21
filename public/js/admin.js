document.addEventListener('DOMContentLoaded', function() {
    // Check if user is admin
    fetch('/api/user/current')
        .then(response => {
            if (!response.ok) {
                throw new Error('Không phản hồi!');
            }
            return response.json();
        })
        .then(data => {
            if (data.role !== 'admin') {
                alert('Bạn không có quyền admin');
                window.location.href = '/';
            }
        })
        .catch(error => {
            console.error('Lỗi xác minh quyền:', error);
            alert('Bạn không có quyền admin');
            window.location.href = '/';
        });

    // Add click handlers for admin buttons
    const adminButtons = document.querySelectorAll('.admin-btn');
    adminButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Placeholder for button actions
            console.log('Button clicked:', this.textContent);
        });
    });

    // Handle logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function() {
            try {
                const response = await fetch('/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    window.location.href = '/';
                } else {
                    console.error('Đăng xuất không thành công');
                }
            } catch (error) {
                console.error('Error during logout:', error);
            }
        });
    }
}); 