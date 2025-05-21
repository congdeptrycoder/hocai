//Nếu bấm nút back/forward
window.addEventListener('pageshow', function (event) {
    if (event.persisted) {
        document.body.classList.remove('page-exiting-left');
        document.documentElement.style.overflowX = '';
        document.body.style.overflowX = '';
    }
});
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
    
    const closeChat = document.getElementById('closeChat');
    const chatInput = document.getElementById('chatInput');
    const sendChatBtn = document.getElementById('sendChatBtn');
    const chatMessages = document.getElementById('chatMessages');

    if (chatButton && chatPopup && closeChat && chatMessages && chatInput && sendChatBtn) {

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
        closeChat.addEventListener('click', () => {
            chatPopup.classList.remove('show');
        });
}
    // Thêm tin nhắn vào khung chat
    function addMessage(message, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
        messageDiv.innerHTML = message;
        chatMessages.appendChild(messageDiv);
        
        // Cuộn xuống tin nhắn mới nhất
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Xử lý gửi tin nhắn
    async function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;

        // Hiển thị tin nhắn của người dùng
        addMessage(message, true);
        chatInput.value = '';

        try {
            const response = await fetch('/chat/process-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
            });

            const data = await response.json();
            addMessage(data.content);
        } catch (error) {
            console.error('Error:', error);
            addMessage('Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.');
        }
    }

    // Xử lý sự kiện gửi tin nhắn
    sendChatBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    //Animation sang trang khác
    document.querySelectorAll('a.link').forEach(link => {
        console.log(link)
        link.addEventListener('click', function (event) {
            const href = this.getAttribute('href');
            const target = this.getAttribute('target'); // Kiểm tra target="_blank"

            // Kiểm tra link hợp lệ, không phải link neo (#) và không phải target="_blank"
            if (href && href !== '#' && !href.startsWith('javascript:') && target !== '_blank') {
                event.preventDefault(); // Ngăn chuyển trang ngay lập tức

                // Ngăn thanh cuộn ngang xuất hiện trong khi chuyển động
                // Áp dụng cho cả html và body để đảm bảo
                document.documentElement.style.overflowX = 'hidden';
                document.body.style.overflowX = 'hidden';

                // Thêm class để kích hoạt animation trượt sang trái
                document.body.classList.add('page-exiting-left');

                // Đợi animation hoàn thành rồi mới chuyển trang
                setTimeout(() => {
                    window.location.href = href;
                }, 500);
            }
        });
    });
});

