const signupBtn = document.getElementById("signup");
const signupBox = document.querySelector(".signup-box");
const loginBox = document.querySelector(".login-box");
const loginBtn = document.getElementById("login");

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