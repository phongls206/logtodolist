// nhap va add se hien thi ra man hinh
const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser) {
  window.location.href = "../log page/index.html";
}

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    window.location.href = "../log page/index.html";
  });
}

const input = document.getElementById("input_area");

const addBtn = document.querySelector(".btn-add");
const clearBtn = document.querySelector(".btn-clear");
const backBtn = document.querySelector(".btn-back");
const searchBtn = document.querySelector(".btn-search");
const display = document.querySelector(".todo-display");
const getCurrentUser = () => JSON.parse(localStorage.getItem("currentUser"));
const savedTask = JSON.parse(localStorage.getItem("todo") || "[]");

const updateUIByUser = () => {
  const ShowAcc = document.getElementById("account");
  const logOut = document.getElementById("logoutBtn");
  const accLabel = document.querySelector(".acc-label");
  const currentUser = getCurrentUser();

  if (currentUser) {
    ShowAcc.textContent = currentUser.name;
    if (logOut) {
      logOut.style.display = "inline-block";
      logOut.onclick = (e) => {
        e.stopPropagation();
        localStorage.removeItem("currentUser");
        window.location.href = "../log page/index.html";
        // location.reload(); // reload để reset UI cho guest
      };
    }
    if (accLabel) accLabel.onclick = null; // disable click redirect khi login
  } else {
    ShowAcc.textContent = "Guest";
    if (logOut) logOut.style.display = "none";
    if (accLabel)
      accLabel.onclick = () => {
        window.location.href = "../log page/index.html";
      };
  }

  // luôn render lại task khi user thay đổi
  renderTask(sortTasks(getUserTasks()));
};

document.addEventListener("DOMContentLoaded", updateUIByUser);

// function fn(param = defaultValue) { ... }
// neu ko truyen j se dung gia tri mac dinh la savedTask
// neu chi co tham so ma ko co default thi neu ko truyen gi se ko dung dc foreach va khi goi rong se loi
//  con ko tham so thi truyen du lieu vao js se bo qua nen ko tien xu ly nhieu truong hop phai viet lai function khác
const sortTasks = (tasks) => {
  return [...tasks].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1; // a lên trước
    if (!a.pinned && b.pinned) return 1; // b lên trước
    return 0; // giữ nguyên
  });
};

const renderTask = (tasks = savedTask) => {
  display.innerHTML = "";

  if (tasks.length === 0) {
    display.innerHTML = "No tasks available !";
    return;
  }

  tasks.forEach((task) => {
    const TaskItem = document.createElement("div");
    TaskItem.className = "task-item";
    TaskItem.style.borderBottom = "2px solid gray";
    TaskItem.setAttribute("data-ID", task.id);
    TaskItem.innerHTML = `
      <input type="checkbox" ${task.check ? "checked" : ""}>
      <span class="task-content ${task.check ? "done" : ""}">${
      task.content
    }</span>
    <button class="btn btn-pin">${task.pinned ? "📍" : "📌"}</button>
      <button class="btn btn-edit">📝</button>
      <button class="btn btn-delete">🗑️</button>
    `;
    display.appendChild(TaskItem);
  });
};

// add
addBtn.addEventListener("click", () => {
  if (!input.value.trim()) return;
  if (
    display.children.length === 0 &&
    display.textContent.includes("No tasks")
  ) {
    display.textContent = "";
  }
  const currentUser = getCurrentUser();
  const newTask = {
    id: Date.now(),
    content: input.value.trim(),
    check: false,
    username: currentUser ? currentUser.name : null,
    pinned: false,
  };

  savedTask.push(newTask);
  localStorage.setItem("todo", JSON.stringify(savedTask));
  renderTask(sortTasks(getUserTasks()));
  input.value = "";
});

// xu ly clear all
// cách 1 quen thuộc với mik hơn
clearBtn.addEventListener("click", () => {
  if (display.childElementCount === 0) {
    alert("No tasks available");
    return;
  }

  const currentUser = getCurrentUser();
  const ok = confirm("Do you want to remove all your tasks?");
  if (!ok) return;

  if (currentUser) {
    for (let i = savedTask.length - 1; i >= 0; i--) {
      if (savedTask[i].username === currentUser.name) {
        savedTask.splice(i, 1);
      }
    }
  } else {
    for (let i = savedTask.length - 1; i >= 0; i--) {
      if (!savedTask[i].username) {
        savedTask.splice(i, 1);
      }
    }
  }

  localStorage.setItem("todo", JSON.stringify(savedTask));
  renderTask(sortTasks(getUserTasks()));
});

// cách 2:
//  clearBtn.addEventListener("click", () => {
//   let remainTasks;
//   if (getAcc) {
//     // Đang login: giữ lại task của user khác
//     remainTasks = savedTask.filter((t) => t.username !== getAcc.name);
//   } else {
//     // Guest: giữ lại task của user đã login (có username)
//     remainTasks = savedTask.filter((t) => t.username);
//   }
//   // Cập nhật lại mảng gốc + localStorage
//   savedTask.length = 0;
//   savedTask.push(...remainTasks);
//   localStorage.setItem("todo", JSON.stringify(savedTask));
//   renderTask(getUserTasks());
// });

// Có getAcc → xoá hết task của user đang login.

// Không có getAcc → xoá hết task của khách (guest, tức username === null).
// vì remaintask chính là mảng saved task đã lọc nên nó chính là mảng nếu k dùng ... thì nó bị thành mảng lồng mảng và gây lỗi
// ...remainTasks là spread operator
// Nó "trải phẳng" mảng remainTasks thành từng phần tử riêng lẻ.
// Nên cái ... chính là để copy toàn bộ phần tử trong remainTasks vào savedTask, thay vì push nguyên mảng.

display.addEventListener("click", (e) => {
  // xử lý pin/unpin
  if (e.target.classList.contains("btn-pin")) {
    const taskItem = e.target.closest(".task-item");
    const taskID = Number(taskItem.getAttribute("data-ID"));
    const task = savedTask.find((t) => t.id === taskID);

    if (task) {
      task.pinned = !task.pinned; // đảo trạng thái
      localStorage.setItem("todo", JSON.stringify(savedTask));
      renderTask(sortTasks(getUserTasks()));
    }
  }

  // Xử lý delete
  if (e.target.classList.contains("btn-delete")) {
    const taskID = Number(e.target.parentElement.getAttribute("data-ID"));
    const index = savedTask.findIndex((task) => task.id === taskID);
    // Vi task id dung datenow() nen no la dang number nen so sanh phai ep kieu ve number chu ko de dang string duoc nua

    if (index !== -1) {
      savedTask.splice(index, 1);
      localStorage.setItem("todo", JSON.stringify(savedTask));
      // renderTask(getUserTasks()); Nếu chỉ xoá đơn giản → e.target.parentElement.remove() là đủ (nhanh, nhẹ).
      // Nếu muốn chắc chắn UI và data luôn khớp trong mọi trường hợp → nên render lại bằng renderTask(getUserTasks()).
    }
    e.target.parentElement.remove();
    if (display.children.length === 0) {
      display.innerHTML = "No tasks available !";
    }
  }
  // Xử lý checkbox
  if (e.target.type === "checkbox") {
    const taskContent = e.target.parentElement.querySelector(".task-content");
    const taskID = Number(e.target.parentElement.getAttribute("data-ID"));
    const index = savedTask.findIndex((task) => task.id === taskID);
    if (index !== -1) {
      savedTask[index].check = e.target.checked;
      localStorage.setItem("todo", JSON.stringify(savedTask));
    }
    // cach 2 de hon ko can findindex nua nma ko toi uu bang index
    //     savedTask.forEach(task => {
    //   if (task.id === taskID) {
    //     task.check = e.target.checked; // mutate trực tiếp
    //   }
    // });
    // element.classList.toggle(className, condition);
    taskContent.classList.toggle("done", e.target.checked);
  }
  // xử lý edit
  if (e.target.classList.contains("btn-edit")) {
    const taskItem = e.target.closest(".task-item");
    const taskContent = taskItem.querySelector(".task-content");
    const taskID = Number(taskItem.getAttribute("data-ID"));
    const TaskCurrent = savedTask.find((e) => e.id === taskID);
    taskContent.contentEditable = true;

    //=========================Học sau===================================//
    // fix caret cuối text

    // Range = vùng chọn trong DOM.

    // Caret = con trỏ để nhập chữ. nó chỉ con trỏ nhấp nháy nơi bạn nhập chữ.

    // Hàm đặt caret (con trỏ) vào cuối text của element
    const setCaretToEnd = (el) => {
      // 1️⃣ Tạo một Range (phạm vi chọn trong DOM)
      const range = document.createRange();
      // 2️⃣ Lấy Selection hiện tại của trình duyệt (nơi con trỏ đang ở)
      const sel = window.getSelection();
      // 3️⃣ Chọn toàn bộ nội dung của element
      range.selectNodeContents(el);
      // 4️⃣ Collapse về cuối (false) → caret sẽ nằm cuối text
      // Nếu collapse(true) → caret sẽ ở đầu text
      range.collapse(false); // đặt caret cuối
      // 5️⃣ Xóa mọi range cũ trong selection (tránh bị highlight text trước đó)
      sel.removeAllRanges();
      // 6️⃣ Thêm range mới vào selection → caret cuối text
      sel.addRange(range);
    };
    setCaretToEnd(taskContent);
    //============================================================================//

    taskContent.focus();
    const saveEdit = () => {
      taskContent.contentEditable = false;
      TaskCurrent.content = taskContent.textContent.trim();
      localStorage.setItem("todo", JSON.stringify(savedTask));
    };
    taskContent.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        saveEdit();
      }
      if (e.key === "Escape") {
        taskContent.textContent = TaskCurrent.content;
        taskContent.contentEditable = false;
        taskContent.blur();
      }
    });
    taskContent.addEventListener("blur", () => {
      saveEdit();
    });
  }
});

// Attribute: thuộc tính chung của mọi element, dùng setAttribute/getAttribute để tạo, đọc, sửa, xóa.
// Dataset: shortcut JS chuyên cho data-* attributes, trực quan hơn, chỉ dùng để lưu dữ liệu tùy ý trên element.
// data-* là các custom attribute do mình tự định nghĩa trên HTML để lưu dữ liệu tùy ý cho element.
// Cú pháp: data-tên="giá trị"
// Không cần setAttribute hay getAttribute nữa, dataset gọn hơn.
// ✅ Tóm lại: data-* là attribute tự tạo, dataset là cách JS truy cập/điều chỉnh attribute đó.

// check all
const checkAllBtn = document.querySelector(".btn-all");

checkAllBtn.addEventListener("click", () => {
  const currentUser = getCurrentUser();
  const userTasks = savedTask.filter(
    (t) => t.username === (currentUser?.name ?? null)
  );

  if (userTasks.length === 0) return; // không có task nào thì thôi

  const allChecked = userTasks.every((t) => t.check);
  userTasks.forEach((t) => (t.check = !allChecked));

  localStorage.setItem("todo", JSON.stringify(savedTask));
  renderTask(sortTasks(getUserTasks()));
});
// array.every(element => condition)
// Nếu tất cả phần tử thỏa condition → trả về true
// Nếu ít nhất 1 phần tử không thỏa condition → trả về false
// parentElement → 1 cấp lên.
// closest() → tìm lên mọi cấp, dừng ở ancestor đầu tiên match selector.

// load lai web van con luu dung domcontetnt vip hon window onload vi load nhanh hon con window onload cham hon vi doi tai all tai nguyen
// Todo app → Dùng DOMContentLoaded ✅

// window.onload chỉ dùng khi bạn thực sự cần chờ tất cả tài nguyên tải xong (slideshow, game online, v.v.).

const searchBox = document.querySelector(".search-box");
const searchTask = document.getElementById("search-Input");
const searchConfirm = document.getElementById("search-Confirm");

searchBtn.addEventListener("click", () => {
  searchBox.classList.toggle("active");
  searchTask.focus();
  searchTask.style.outline = "none";
});

// Trong filter(), callback phải trả về true/false để quyết định giữ hay bỏ phần tử.
// Hiện tại bạn chỉ viết biểu thức nhưng không return → mặc định callback trả undefined → không lọc được gì, kết quả luôn là mảng rỗng.
// hoac viet nhanh arrow function nhu ben duoi
searchConfirm.addEventListener("click", () => {
  if (!searchTask.value) return;
  const searchValue = searchTask.value.toLowerCase().trim();
  const filterResult = getUserTasks().filter((task) =>
    task.content.toLowerCase().trim().includes(searchValue)
  );
  renderTask(sortTasks(filterResult));
});
searchTask.addEventListener("input", () => {
  if (!searchTask.value.trim()) {
    renderTask(getUserTasks()); // render tất cả task khi xóa input
  }
});

// xu ly nut hienAll
backBtn.addEventListener("click", () => {
  if (savedTask.length === 0) return;
  renderTask(sortTasks(getUserTasks()));
});

// task done
const btnDone = document.querySelector(".btn-done");
btnDone.addEventListener("click", () => {
  const DoneTask = getUserTasks().filter((task) => task.check);
  if (DoneTask.length === 0) {
    display.innerHTML = "No completed tasks !";
    return;
  }
  renderTask(sortTasks(DoneTask));
});
// task pending
const btnPending = document.querySelector(".btn-pending");
btnPending.addEventListener("click", () => {
  const pendingTask = getUserTasks().filter((task) => !task.check);
  if (pendingTask.length === 0) {
    display.innerHTML = "No pending tasks !";
    return;
  }
  renderTask(sortTasks(pendingTask));
});

// cach 2 kho maintain hon nma ko lap code

// const showFilteredTasks = (conditionFn, emptyMsg) => {
//   const tasks = savedTask.filter(conditionFn);
//   if (tasks.length === 0) {
//     display.innerHTML = emptyMsg;
//     return;
//   }
//   renderTask(tasks);
// };

// btnDone.addEventListener("click", () =>
//   showFilteredTasks(task => task.check, "No completed tasks!")
// );

// btnPending.addEventListener("click", () =>
//   showFilteredTasks(task => !task.check, "No pending tasks!")
// );

// change Theme
const themeBtn = document.querySelector(".btn-theme");
const todoUI = document.getElementById("todo-ui");
const title = document.getElementById("todo-title");
const doraemon = todoUI.querySelector(".doraemon");
const todoAll = todoUI.querySelector(".todo-btn");
const accLabel = document.querySelector(".acc-label");

themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("theme");
  todoUI.classList.toggle("theme");
  doraemon.classList.toggle("theme");
  title.classList.toggle("theme");
  todoAll.classList.toggle("theme");
  accLabel.classList.toggle("theme");
  inner.classList.toggle("theme");
  searchConfirm.classList.toggle("theme");

  document.querySelectorAll(".task-item .btn-edit").forEach((btn) => {
    btn.classList.toggle("theme");
  });
  document.querySelectorAll(".task-item .btn-pin").forEach((btn) => {
    btn.classList.toggle("theme");
  });
  document.querySelectorAll(".task-item .btn-delete").forEach((btn) => {
    btn.classList.toggle("theme");
  });

  let newSrc;
  if (title.textContent === "DRAGON BALL Z") {
    title.textContent = "DORAEMON";
    newSrc = "doremonmusic.mp3";
  } else {
    title.textContent = "DRAGON BALL Z";
    newSrc = "dragonball.mp3";
  }

  if (btnMusic.classList.contains("MusicActive")) {
    // nếu đang bật nhạc thì đổi bài và play
    if (!audio.src.includes(newSrc)) {
      audio.src = newSrc;
      audio.play();
    }
  } else {
    // nếu nhạc đang tắt thì chỉ đổi src thôi
    audio.src = newSrc;
    audio.pause();
    audio.currentTime = 0;
  }
});

// Không phải bắt buộc, nhưng trong dropdown hover + click, dùng e.stopPropagation() sẽ tránh lỗi click không chạy do parent “xóa” dropdown quá nhanh.

// ham de loc theo user tranh bi lap lai data khi dang o user khac
const getUserTasks = () => {
  const tasks = JSON.parse(localStorage.getItem("todo") || "[]");
  const currentUser = getCurrentUser();
  if (!currentUser) return tasks;
  return tasks.filter((task) => task.username === currentUser.name);
};
// music
const btnMusic = document.querySelector(".PlayMusic");
const audio = document.querySelector("audio");
const inner = btnMusic.querySelector(".PlayMusic__inner");

btnMusic.addEventListener("click", () => {
  if (btnMusic.classList.contains("MusicActive")) {
    // đang bật -> tắt
    btnMusic.classList.remove("MusicActive");
    audio.pause();
  } else {
    // đang tắt -> bật
    btnMusic.classList.add("MusicActive");
    audio.play();
  }
});
