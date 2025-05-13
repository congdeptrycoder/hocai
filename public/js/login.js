const signupBtn = document.getElementById("signup");
const signupBox = document.querySelector(".signup-box");
const loginBox = document.querySelector(".login-box");
const loginBtn = document.getElementById("login");
const googleLoginButtons = document.querySelectorAll(".google-login-button");

signupBtn.addEventListener("click", function (e) {
    if (!signupBox.classList.contains("active")) {
        e.preventDefault();
        signupBox.style.display = "flex";
        signupBox.classList.add("active");
        loginBox.classList.remove("active");
        loginBox.style.display = "none";
    }
});
loginBtn.addEventListener("click", function (e) {
    if (!loginBox.classList.contains("active")) {
        e.preventDefault();
        loginBox.style.display = "flex";
        loginBox.classList.add("active");
        signupBox.classList.remove("active");
        signupBox.style.display = "none";
    }
});
googleLoginButtons.forEach(button => {
    button.addEventListener("click", function (e) {
        e.preventDefault();
        window.location.href = '/auth/google';
    });
});

document.addEventListener("DOMContentLoaded", function () {
    // Đăng nhập
    const loginForm = document.querySelector('.login-box form');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            const passwordInput = loginForm.querySelector('input[name="password"]');
            const password = passwordInput.value;
            removeError(loginForm);
            if (password.length < 6) {
                e.preventDefault();
                showError(loginForm, 'Mật khẩu phải có ít nhất 6 ký tự.');
                passwordInput.focus();
            }
        });
    }

    // Đăng ký
    const signupForm = document.querySelector('.signup-box form');
    if (signupForm) {
        signupForm.addEventListener('submit', function (e) {
            const accountInput = signupForm.querySelector('input[name="account"]');
            const displayNameInput = signupForm.querySelector('input[name="displayName"]');
            const passwordInput = signupForm.querySelector('input[name="password"]');
            const confirmPasswordInput = signupForm.querySelector('input[name="confirmPassword"]');
            const account = accountInput.value;
            const displayName = displayNameInput.value;
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;
            removeError(signupForm);
            // Account không ký tự đặc biệt, tối thiểu 4 ký tự
            if (!/^[a-zA-Z0-9_]{4,}$/.test(account)) {
                e.preventDefault();
                showError(signupForm, 'Tài khoản chỉ được chứa chữ, số, dấu gạch dưới và tối thiểu 4 ký tự.');
                accountInput.focus();
                return;
            }
            // Mật khẩu >= 6 ký tự
            if (password.length < 6) {
                e.preventDefault();
                showError(signupForm, 'Mật khẩu phải có ít nhất 6 ký tự.');
                passwordInput.focus();
                return;
            }
            // Mật khẩu phải có ít nhất 1 chữ hoa, 1 số, 1 ký tự đặc biệt
            if (!(/[A-Z]/.test(password) && /[0-9]/.test(password) && /[^a-zA-Z0-9]/.test(password))) {
                e.preventDefault();
                showError(signupForm, 'Mật khẩu phải có ít nhất 1 chữ cái in hoa, 1 số và 1 ký tự đặc biệt.');
                passwordInput.focus();
                return;
            }
            // Xác nhận mật khẩu
            if (password !== confirmPassword) {
                e.preventDefault();
                showError(signupForm, 'Mật khẩu xác nhận không khớp.');
                confirmPasswordInput.focus();
                return;
            }
        });
    }

    // Hàm hiển thị lỗi
    function showError(form, message) {
        removeError(form);
        const error = document.createElement('div');
        error.className = 'error-message';
        error.textContent = message;
        form.insertBefore(error, form.firstChild);
    }
    // Hàm xóa lỗi
    function removeError(form) {
        const oldError = form.querySelector('.error-message');
        if (oldError) oldError.remove();
    }
});