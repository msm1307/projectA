const loginBtn = document.querySelector(".login a");

loginBtn.addEventListener('click', function(e) {
    e.preventDefault();
    window.open('login.html', 'subPage', "width=570, height=350, resizable = no, scrollbars = no");
});

function nickNameCheck() {
    const nickName = document.getElementById("nickName");
    const userUl = document.querySelector(".user");
    const loginTag = document.querySelector(".login");

    if (localStorage.getItem('nickName')) {
        userUl.style.display = "flex";
        loginTag.style.display = "none";
        nickName.innerText = localStorage.getItem('nickName') + "님";
    } else {
        userUl.style.display = "none";
        loginTag.style.display = "block";
    }
}
nickNameCheck();
const logOut = document.getElementById("logOut");
logOut.addEventListener("click", function() {
    localStorage.clear();
    nickNameCheck();
})