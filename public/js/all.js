//Hiệu ứng scroll
const scrollElements = document.querySelectorAll('.scroll');

if (scrollElements.length > 0) {
    const scrollOptions = {
        root: null, // Sử dụng viewport làm gốc
        rootMargin: '0px', // Không có khoảng đệm
        threshold: 0.1 // Kích hoạt khi 10% phần tử hiển thị
    };

    const scrollCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    };
    const scrollObserver = new IntersectionObserver(scrollCallback, scrollOptions);
    scrollElements.forEach(el => {
        scrollObserver.observe(el);
    });
}
document.addEventListener('DOMContentLoaded', function () {
    const scrollToTopButton = document.querySelector('.scroll-to-top');
    const scrollscreen = 150;
    // Hàm hiển thị scroll-to-top
    function toggleScrollToTopButton() {
        // window.pageYOffset là thuộc tính cũ, dùng document.documentElement.scrollTop cho các trình duyệt hiện đại
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

        if (currentScroll > scrollscreen) {
            scrollToTopButton.classList.add('show');
        } else {
            scrollToTopButton.classList.remove('show');
        }
    }

    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    window.addEventListener('scroll', toggleScrollToTopButton);

    if (scrollToTopButton) {
        scrollToTopButton.addEventListener('click', scrollToTop);
    }
    //Box chat
    const chatButton = document.getElementById('chatButton');
    const chatPopup = document.getElementById('chatPopup');
    const closeChatBtn = document.getElementById('closeChat');
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const sendChatBtn = document.getElementById('sendChatBtn');

    let firstUserMessageSent = false;
    if (chatButton && chatPopup && closeChatBtn && chatMessages && chatInput && sendChatBtn) {

        chatButton.addEventListener('click', () => {
            if (chatPopup.classList.contains('show')) {
                chatPopup.classList.remove('show');
            }
            else {
                chatPopup.classList.add('show');
                chatInput.focus();
            }
        });

        // Ẩn popup khi click vào nút đóng
        closeChatBtn.addEventListener('click', () => {
            chatPopup.classList.remove('show');
        });

        // Hàm gửi tin nhắn
        const sendMessage = () => {
            const messageText = chatInput.value.trim(); // Lấy text và xóa khoảng trắng thừa

            if (messageText === '') {
                return; // Không gửi nếu tin nhắn rỗng
            }

            // 1. Hiển thị tin nhắn của người dùng
            appendMessage(messageText, 'user');

            // 2. Xóa nội dung trong ô input
            chatInput.value = '';

            // 3. Kiểm tra và gửi tin nhắn trả lời tự động nếu là tin đầu tiên
            if (!firstUserMessageSent) {
                firstUserMessageSent = true; // Đánh dấu là đã gửi tin đầu tiên

                // Gửi tin nhắn bot sau một khoảng trễ nhỏ (tùy chọn)
                setTimeout(() => {
                    const autoReply = "Đợi kết nối với nhân viên... Nếu quá lâu hãy liên hệ chúng tôi bằng phản hồi";
                    appendMessage(autoReply, 'bot');
                }, 500); // Trễ 0.5 giây
            }

            // Tự động cuộn xuống tin nhắn mới nhất
            scrollToBottom();
        };

        // Gửi tin nhắn khi click nút Gửi
        sendChatBtn.addEventListener('click', sendMessage);

        // Gửi tin nhắn khi nhấn Enter trong ô input
        chatInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault(); // Ngăn hành động mặc định của Enter (thường là submit form)
                sendMessage();
            }
        });

        // --- Hàm tiện ích ---

        // Hàm để thêm tin nhắn vào khu vực hiển thị
        const appendMessage = (text, type) => {
            const messageElement = document.createElement('div');
            messageElement.classList.add('message', type); // Thêm class 'message' và class type ('user' hoặc 'bot')
            messageElement.textContent = text;
            chatMessages.appendChild(messageElement);
        };

        // Hàm để cuộn xuống cuối khu vực tin nhắn
        const scrollToBottom = () => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
    //Animation sang trang khác
    document.querySelectorAll('a.link').forEach(link => {
        console.log(link)
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const overlay = document.querySelector('.transition-overlay');
            overlay.classList.add('active');
            setTimeout(() => {
                window.location.href = this.href;
            }, 400); // Thời gian khớp với transition CSS
        });
    });
});