const choiceBoxes = document.querySelectorAll('.demo-box-choice');
const demoImage = document.querySelector('.demo-image');

// Tạo một đối tượng ánh xạ giữa box và ảnh tương ứng
const boxToImageMap = {
    0: 'asset/logo/demo1.png', // Đường dẫn ảnh cho box 1
    1: 'asset/logo/demo2.png', // Đường dẫn ảnh cho box 2
    2: 'asset/logo/demo3.png'  // Đường dẫn ảnh cho box 3
};

// Hiển thị thông báo mặc định ban đầu
demoImage.innerHTML = '<p class="default-message">Hãy chọn để xem giao diện của chúng tôi</p>';

choiceBoxes.forEach((box, index) => {
    box.addEventListener('click', function () {
        // Thêm/xóa border active
        this.classList.toggle('active-border');

        // Loại bỏ active-border từ các box khác
        choiceBoxes.forEach(otherBox => {
            if (otherBox !== this) {
                otherBox.classList.remove('active-border');
            }
        });

        // Kiểm tra nếu box hiện tại đang active
        if (this.classList.contains('active-border')) {
            // Hiển thị ảnh tương ứng
            demoImage.innerHTML = `<img src="${boxToImageMap[index]}" alt="Demo ${index + 1}">`;
        } else {
            // Nếu không có box nào được chọn, hiển thị thông báo
            demoImage.innerHTML = '<p class="default-message">Hãy chọn để xem giao diện của chúng tôi</p>';
        }
    });
});
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