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
});
document.addEventListener('DOMContentLoaded', function () {

    // const logininfo = document.getElementById('login-info');
    // const popupOverlay = document.getElementById('userPopupOverlay');
    // const userInfoPopup = document.getElementById('userInfoPopup');
    // const closePopupBtn = document.getElementById('closePopupBtn');
    // const bodyElement = document.body; // Lấy tham chiếu đến thẻ body

    // const usernameSpan = document.getElementById('popup-username');
    // const accountSpan = document.getElementById('popup-account');
    // const emailSpan = document.getElementById('popup-email');
    // const loginDateSpan = document.getElementById('popup-logindate');
    // const coursesDiv = document.getElementById('popup-courses');

    // // --- Dữ liệu demo ---
    // const demoUserData = {
    //     username: "Top1BachKhoa",
    //     account: "top1_bachkhoa",
    //     email: "top1_bachkhoa@hust.edu.vn",
    //     courses: [
    //         "Ứng dụng trí tuệ nhân tạo (ChatGPT,...) - Bài 2",
    //         "Kahoot (Tạo trò chơi giáo dục) - Bài 2",
    //         "Gammar AI (Tạo slide tự động) - Hoàn thành"
    //     ]
    // };

    // // --- Hàm để hiển thị popup ---
    // function showPopup() {
    //     // 1. Điền dữ liệu vào popup (giữ nguyên như trước)
    //     usernameSpan.textContent = demoUserData.username;
    //     accountSpan.textContent = demoUserData.account;
    //     emailSpan.textContent = demoUserData.email;
    //     const now = new Date();
    //     const formattedDate = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()} ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
    //     loginDateSpan.textContent = formattedDate;

    //     let coursesHtml = '<ul>';
    //     if (demoUserData.courses && demoUserData.courses.length > 0) {
    //         demoUserData.courses.forEach(course => {
    //             coursesHtml += `<li>${course}</li>`;
    //         });
    //     } else {
    //         coursesHtml += '<li>Bạn chưa đăng ký khóa học nào.</li>';
    //     }
    //     coursesHtml += '</ul>';
    //     coursesDiv.innerHTML = coursesHtml;

    //     // --- Ngăn cuộn trang chính ---
    //     // Tính độ rộng thanh cuộn (để tránh dịch chuyển layout)
    //     const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;



    //     bodyElement.style.overflow = 'hidden';

    //     popupOverlay.classList.add('active');
    // }

    // function hidePopup() {
    //     bodyElement.style.overflow = '';

    //     popupOverlay.classList.remove('active');
    // }

    // // --- Gán sự kiện (giữ nguyên như trước) ---
    // if (logininfo) {
    //     logininfo.addEventListener('click', function (event) {
    //         event.preventDefault();
    //         showPopup();
    //     });
    // }

    // if (closePopupBtn) {
    //     closePopupBtn.addEventListener('click', hidePopup);
    // }

    // if (popupOverlay) {
    //     popupOverlay.addEventListener('click', function (event) {
    //         if (event.target === popupOverlay) {
    //             hidePopup();
    //         }
    //     });
    // }

    // document.addEventListener('keydown', function (event) {
    //     if (event.key === 'Escape' && popupOverlay.classList.contains('active')) {
    //         hidePopup();
    //     }
    // });

});