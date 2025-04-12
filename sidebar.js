document.addEventListener('DOMContentLoaded', function () {
    const toggleBtn = document.querySelector('.side-bar-toggle svg');
    const sideBarMenu = document.querySelector('.side-bar-menu');
    toggleBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        this.classList.toggle('active');
        sideBarMenu.classList.toggle('active');
    });

    document.addEventListener('click', function (e) {
        if (!sideBarMenu.contains(e.target) && e.target !== toggleBtn) {
            toggleBtn.classList.remove('active');
            sideBarMenu.classList.remove('active');
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