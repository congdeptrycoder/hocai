document.addEventListener('DOMContentLoaded', function () {
    const toggleBtn = document.querySelector('.side-bar-toggle svg');
    const sidebarMenu = document.querySelector('.side-bar-menu');
    toggleBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        this.classList.toggle('active');
        sidebarMenu.classList.toggle('active');
    });

    document.addEventListener('click', function (e) {
        if (!sidebarMenu.contains(e.target) && e.target !== toggleBtn) {
            toggleBtn.classList.remove('active');
            sidebarMenu.classList.remove('active');
        }
    });


    const dropdownParents = document.querySelectorAll('.side-bar-menu > ul > li:has(.dropdown-menu)');
    dropdownParents.forEach(parent => {
        const link = parent.querySelector('a');
        const dropdown = parent.querySelector('.dropdown-menu');

        link.addEventListener('click', function (e) {
            if (window.innerWidth <= 900) {
                e.preventDefault();
                e.stopPropagation();
                dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
            }
        });
    });
    const loginInfoLink = document.getElementById('login-info');
    const logoutButton = document.getElementById('logoutButtonFromPopup');
    const userPopupOverlay = document.getElementById('userPopupOverlay');
    const userInfoPopupContainer = document.getElementById('userInfoPopup'); // Đổi tên biến để rõ hơn
    const closePopupBtn = document.getElementById('closePopupBtn');
    const bodyElement = document.body;

    const popupUsername = document.getElementById('popup-username');
    const popupAccount = document.getElementById('popup-account');
    const popupEmail = document.getElementById('popup-email');
    const popupLoginDate = document.getElementById('popup-logindate');
    const popupCourses = document.getElementById('popup-courses');

    async function fetchAndShowUserInfo() {
        try {
            const response = await fetch('/api/user/current');
            if (response.ok) {
                const userData = await response.json();
                if (userData && userData.username) {
                    loginInfoLink.textContent = `Xin chào, ${userData.username}`;
                    loginInfoLink.removeAttribute('href'); // Xóa href="/login"
                    loginInfoLink.style.cursor = 'pointer'; // Đổi con trỏ để biết là có thể click

                    // Gán sự kiện click để mở popup CHỈ KHI đã đăng nhập
                    loginInfoLink.onclick = function (event) { // Sử dụng onclick để dễ dàng gỡ bỏ hoặc thay đổi
                        event.preventDefault();
                        // Điền thông tin vào popup trước khi hiển thị
                        if (popupUsername) popupUsername.textContent = userData.username;
                        if (popupAccount) popupAccount.textContent = userData.account || 'N/A';
                        if (popupEmail) popupEmail.textContent = userData.email;
                        if (popupLoginDate) popupLoginDate.textContent = userData.time_create;
                        // TODO: Lấy và hiển thị khóa học (nếu có)
                        if (popupCourses) popupCourses.innerHTML = '<ul><li>Bạn chưa đăng ký khóa học nào.</li></ul>';

                        showUserPopup();
                    };
                } else { // Trường hợp API trả về OK nhưng không có userData.username (ít xảy ra)
                    setLoginLinkDefault();
                }
            } else if (response.status === 401) { // Chưa đăng nhập
                setLoginLinkDefault();
            } else { // Lỗi khác từ API
                console.error('API error:', response.status, await response.text());
                setLoginLinkDefault();
            }
        } catch (error) {
            console.error('Lỗi khi lấy thông tin người dùng:', error);
            setLoginLinkDefault();
        }
    }

    function setLoginLinkDefault() {
        loginInfoLink.textContent = 'Đăng nhập';
        loginInfoLink.setAttribute('href', '/login');
        loginInfoLink.style.cursor = '';
        loginInfoLink.onclick = null;
    }

    function showUserPopup() {
        if (userPopupOverlay && userInfoPopupContainer) {
            userPopupOverlay.classList.add('active');
            bodyElement.style.overflow = 'hidden';
        }
    }

    function hideUserPopup() {
        if (userPopupOverlay) {
            userPopupOverlay.classList.remove('active');
            bodyElement.style.overflow = '';
        }
    }

    if (loginInfoLink) {
        fetchAndShowUserInfo(); // Gọi khi trang tải xong
    }

    if (closePopupBtn) {
        closePopupBtn.addEventListener('click', hideUserPopup);
    }

    if (userPopupOverlay) {
        userPopupOverlay.addEventListener('click', function (event) {
            // Đóng popup chỉ khi click vào overlay, không phải vào content của popup
            if (event.target === userPopupOverlay) {
                hideUserPopup();
            }
        });
    }

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && userPopupOverlay && userPopupOverlay.classList.contains('active')) {
            hideUserPopup();
        }
    });
    if (logoutButton) {
        logoutButton.addEventListener('click', async function () {
            try {
                // Sử dụng fetch để gửi yêu cầu POST đến /logout
                const response = await fetch('/logout', {
                    method: 'POST',
                    headers: {
                        // Thêm các header cần thiết nếu có, ví dụ CSRF token
                        // 'Content-Type': 'application/json' // Không cần cho POST rỗng
                    }
                });

                if (response.ok) {
                    // Nếu server trả về redirect, trình duyệt sẽ tự động theo sau
                    // Hoặc nếu server trả về JSON success, bạn có thể redirect ở đây
                    console.log('Đăng xuất thành công, đang chuyển hướng...');
                    window.location.href = '/'; // Đảm bảo chuyển hướng về trang chủ
                } else {
                    // Xử lý lỗi nếu có từ server
                    console.error('Lỗi đăng xuất:', response.status, await response.text());
                    alert('Đăng xuất không thành công. Vui lòng thử lại.');
                }
            } catch (error) {
                console.error('Lỗi khi gửi yêu cầu đăng xuất:', error);
                alert('Đã xảy ra lỗi. Vui lòng thử lại.');
            }
        });
    }
});
