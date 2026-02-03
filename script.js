// ==== ELEMENTS ====
const taskForm = document.getElementById("task-form");
const confirmCloseDialog = document.getElementById("confirm-close-dialog");
const openTaskFormBtn = document.getElementById("open-task-form-btn");
const closeTaskFormBtn = document.getElementById("close-task-form-btn");
const addOrUpdateTaskBtn = document.getElementById("add-or-update-task-btn");
const cancelBtn = document.getElementById("cancel-btn");
const discardBtn = document.getElementById("discard-btn");
const tasksContainer = document.getElementById("tasks-container");
const titleInput = document.getElementById("title-input");
const descriptionInput = document.getElementById("description-input");
const hourInput = document.getElementById("hour-input");
const minuteInput = document.getElementById("minute-input");
const dayCheckboxes = document.querySelectorAll(".day-checkbox");

const taskData = JSON.parse(localStorage.getItem("data")) || [];
let currentTask = {};

// ==== THEME TOGGLE ====
const toggleBtn = document.getElementById("theme-toggle");
toggleBtn.addEventListener("click", () => {
  const html = document.documentElement;
  const theme = html.getAttribute("data-theme");
  html.setAttribute("data-theme", theme === "light" ? "dark" : "light");
  toggleBtn.textContent = theme === "light" ? "☀️" : "🌙";
});

// ==== REMOVE SPECIAL CHARACTERS FUNCTION ====
const removeSpecialChars = (val) => val.trim().replace(/[^A-Za-z0-9\u0600-\u06FF\s\-]/g, '');

// ==== ADD OR UPDATE TASK ====
const addOrUpdateTask = () => {
  if(!titleInput.value.trim()){
    alert("Please provide a title");
    return;
  }

  const selectedDays = Array.from(dayCheckboxes).filter(c => c.checked).map(c => c.value);
  const taskObj = {
    id: `${Date.now()}`,
    title: titleInput.value,
    description: descriptionInput.value,
    hour: hourInput.value || 0,
    minute: minuteInput.value || 0,
    days: selectedDays
  };

  const dataArrIndex = taskData.findIndex(t => t.id === currentTask.id);
  if(dataArrIndex === -1){
    taskData.unshift(taskObj);
  } else {
    taskData[dataArrIndex] = taskObj;
  }

  localStorage.setItem("data", JSON.stringify(taskData));
  updateTaskContainer();
  reset();
}

// ==== UPDATE TASK CONTAINER ====
const updateTaskContainer = () => {
  tasksContainer.innerHTML = "";
  taskData.forEach(({id, title, description, hour, minute, days}) => {
    tasksContainer.innerHTML += `
      <div class="task" id="${id}">
        <p><strong>Title:</strong> ${title}</p>
        <p><strong>Description:</strong> ${description}</p>
        <p><strong>Time:</strong> ${hour.padStart(2,'0')}:${minute.padStart(2,'0')}</p>
        <p><strong>Days:</strong> ${days.join(', ')}</p>
        <button onclick="editTask(this)" class="btn btn-edit">Edit</button>
        <button onclick="deleteTask(this)" class="btn btn-delete">Delete</button>
      </div>`;
  });
}

// ==== DELETE TASK ====
const deleteTask = (btn) => {
  const index = taskData.findIndex(t => t.id === btn.parentElement.id);
  btn.parentElement.remove();
  taskData.splice(index, 1);
  localStorage.setItem("data", JSON.stringify(taskData));
}

// ==== EDIT TASK ====
const editTask = (btn) => {
  const index = taskData.findIndex(t => t.id === btn.parentElement.id);
  currentTask = taskData[index];

  titleInput.value = currentTask.title;
  descriptionInput.value = currentTask.description;
  hourInput.value = currentTask.hour;
  minuteInput.value = currentTask.minute;

  dayCheckboxes.forEach(c => c.checked = currentTask.days.includes(c.value));

  addOrUpdateTaskBtn.textContent = "Update Task";
  taskForm.classList.remove("hidden");
}

// ==== RESET FORM ====
const reset = () => {
  titleInput.value = "";
  descriptionInput.value = "";
  hourInput.value = "";
  minuteInput.value = "";
  dayCheckboxes.forEach(c => c.checked = false);
  addOrUpdateTaskBtn.textContent = "Add Task";
  taskForm.classList.add("hidden");
  currentTask = {};
}

// ==== OPEN/CLOSE FORM ====
openTaskFormBtn.addEventListener("click", () => taskForm.classList.remove("hidden"));
closeTaskFormBtn.addEventListener("click", () => taskForm.classList.add("hidden"));

// ==== CONFIRM DISCARD ====
cancelBtn.addEventListener("click", () => confirmCloseDialog.close());
discardBtn.addEventListener("click", () => { confirmCloseDialog.close(); reset(); });

// ==== FORM SUBMIT ====
taskForm.addEventListener("submit", e => { e.preventDefault(); addOrUpdateTask(); });

// ==== INITIALIZE TASKS ====
if(taskData.length) updateTaskContainer();

// ==== NOTIFICATIONS ====
if ("Notification" in window && Notification.permission !== "granted") {
  Notification.requestPermission();
}

function checkNotifications(){
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const daysOfWeek = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const today = daysOfWeek[now.getDay()];

  taskData.forEach(task => {
    if(task.days.includes(today)){
      if(parseInt(task.hour) === currentHour && parseInt(task.minute) === currentMinute){
        if(Notification.permission === "granted"){
          new Notification(`📝 Reminder: ${task.title}`, {
            body: task.description || 'No Description',
            icon: 'https://cdn-icons-png.flaticon.com/512/3179/3179068.png'
          });
        }
      }
    }
  });
}

setInterval(checkNotifications, 60000);
