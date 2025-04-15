//Demo- Chọn xem demo giao diện
const choiceBoxes = document.querySelectorAll('.demo-box-choice');
const demoImage = document.querySelector('.demo-image');
const boxToImageMap = {
    0: 'public/images/logo/demo1.png',
    1: 'public/images/logo/demo2.png',
    2: 'public/images/logo/demo3.png'
};
demoImage.innerHTML = '<p class="default-message">Hãy chọn để xem giao diện của chúng tôi</p>';
choiceBoxes.forEach((box, index) => {
    box.addEventListener('click', function () {
        this.classList.toggle('active-border');
        choiceBoxes.forEach(otherBox => {
            if (otherBox !== this) {
                otherBox.classList.remove('active-border');
            }
        });

        if (this.classList.contains('active-border')) {
            demoImage.innerHTML = `<img src="${boxToImageMap[index]}" alt="Demo ${index + 1}">`;
        } else {
            demoImage.innerHTML = '<p class="default-message">Hãy chọn để xem giao diện của chúng tôi</p>';
        }
    });
});
