// Account;
const user = document.getElementById("username");
const pass = document.getElementById("password");
// lay du lieu tu local da luu ben register de check
const savedUser = JSON.parse(localStorage.getItem("acc") || "[]");

// const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i; dung them lenh test de tra ve true + trim xac thuc user nhap dang mail hay thuong

// xac thuc
const authentication = () => {
  const usernameInput = user.value.trim();
  const passwordInput = pass.value.trim();
  const isEmail = user.type === "email";

  if (!usernameInput || !passwordInput) {
    alert("Username or Password can't be empty");
    return;
  }

  if (isEmail) {
    const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,63}$/;
    if (!EMAIL_RE.test(usernameInput)) {
      alert("Email format is wrong");
      return;
    }
  } else {
    const SPECIAL_CHAR_RE = /[^\w]/;
    if (SPECIAL_CHAR_RE.test(usernameInput)) {
      alert("Username cannot contain special characters");
      return;
    }
    if (usernameInput.length < 5 || usernameInput.length > 15) {
      alert("Username must be 5-15 characters");
      return;
    }
  }

  const PASS_RE =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,15}$/;
  if (!PASS_RE.test(passwordInput)) {
    alert(
      "Password must be 6-15 characters, include letters, numbers, and special characters!"
    );
    return;
  }

  // Move matchAcc xuống đây sau khi validate
  const matchAcc = savedUser.find(
    (acc) =>
      (usernameInput === acc.name && passwordInput === acc.password) ||
      (usernameInput === acc.email && passwordInput === acc.password)
  );

  if (matchAcc) {
    localStorage.setItem("currentUser", JSON.stringify(matchAcc));
    if (rememberBtn.checked) {
      localStorage.setItem(
        "remember",
        JSON.stringify({ username: usernameInput, password: passwordInput })
      );
    } else {
      localStorage.removeItem("remember");
    }
    alert("Login Successfully");
    setTimeout(() => {
      window.location.href = "../Train_todolist/index.html";
    }, 1000);
  } else {
    alert("Username Or Password Is Not Correct");
  }
};

// login click
const login = document.getElementById("btn");
login.addEventListener("click", (e) => {
  e.preventDefault();
  authentication();
});

// show PASS
const showPass = document.querySelector(".fa-lock");
showPass.addEventListener("click", () => {
  if (pass.type === "password") {
    pass.type = "text";
    showPass.classList.remove("fa-lock");
    showPass.classList.add("fa-unlock");
  } else {
    pass.type = "password";
    showPass.classList.add("fa-lock");
    showPass.classList.remove("fa-unlock");
  }
});

// change login form dung toggle cho le
const changeLogin = document.querySelector(".fa-solid.fa-user");
changeLogin.addEventListener("click", () => {
  if (user.placeholder === "Username") {
    user.placeholder = "Email";
    user.type = "email";
  } else {
    user.placeholder = "Username";
    user.type = "text";
  }
  changeLogin.classList.toggle("fa-user");
  changeLogin.classList.toggle("fa-envelope");
});

// xu ly phan remember
const rememberBtn = document.getElementById("remember");
// Để khi load trang form tự điền username/password nếu đã lưu:
window.onload = () => {
  const saved = JSON.parse(localStorage.getItem("remember") || "{}");
  // neu ma no khop voi cai account dc luu khi tick vao checked thi gan value = cai do len man luon
  if (saved.username && saved.password) {
    const savedMatch = savedUser.find(
      (acc) =>
        (saved.username === acc.name && saved.password === acc.password) ||
        (saved.username === acc.email && saved.password === acc.password)
    );
    if (savedMatch) {
      user.value = saved.username;
      pass.value = saved.password;
      rememberBtn.checked = true;
    } else {
      localStorage.removeItem("remember");
    }
  }
};
