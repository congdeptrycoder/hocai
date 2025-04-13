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

});