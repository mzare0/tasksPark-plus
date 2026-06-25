// ============================================
// DOM ELEMENT REFERENCES
// ============================================

// Auth/Login elements
const loginBtn = document.getElementById("loginBtn");
const successMessage = document.querySelector(".successMessage");
const userName = document.getElementById("userName");
const registerForm = document.getElementById("registerForm");
const authSection = document.getElementById("authSection");
const tasksparkMain = document.getElementById("tasksparkMain");

// UI elements
const menuIcon = document.querySelector(".menuIcon");
const sidebar = document.querySelector(".desktopSidebar");
const overlay = document.querySelector("#overlay");
const avatar = document.getElementById("avatar");
const profileName = document.getElementById("profileName");

// Task form elements
const taskInput = document.getElementById("taskInput");
const categorySelect = document.getElementById("categorySelect");
const saveTaskBtn = document.getElementById("saveTaskBtn");
const tasksListSection = document.getElementById("tasksListSection");
const heroBanner = document.getElementById("heroBanner");

// Empty state elements
const speechBubble = document.getElementById("speechBubble");
const emptyMessage = document.getElementById("emptyMessage");

// Action buttons
const darkModeBtn = document.getElementById("darkmodeBtn");
const logoutBtn = document.getElementById("logoutBtn");

// Stats display elements
const completedCount = document.getElementById("completedCount");
const incompleteCount = document.getElementById("incompleteCount");
const totalCount = document.getElementById("totalCount");

// DARK MODE FUNCTIONALITY

const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
}

// Toggle dark mode and save preference to localStorage
darkModeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    localStorage.setItem("theme", isDark ? "dark" : "light");
});

// ============================================
// USER AUTHENTICATION / SESSION MANAGEMENT
// ============================================

// Check if user is already logged in (saved in localStorage)
const savedUser = localStorage.getItem("username");
if (savedUser) {
    authSection.style.display = "none";
    tasksparkMain.classList.remove("hidden");
    avatar.textContent = savedUser.charAt(0).toUpperCase();
    profileName.textContent = savedUser.toUpperCase();
} else {
    authSection.style.display = "block";
    tasksparkMain.classList.add("hidden");
}

// Handle user registration/login
registerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    
    const userNameValue = userName.value.trim();
    localStorage.setItem("username", userNameValue);
    
    if (userNameValue === "") {
        return; 
    }
    
    // Show welcome message
    const welcomeMsg = `welcome ${userNameValue}`;
    successMessage.textContent = welcomeMsg;
    successMessage.classList.add("show");
    
    setTimeout(() => {
        successMessage.classList.remove("show");
        authSection.style.display = "none";
        tasksparkMain.classList.remove("hidden");
    }, 3000);
});

// ============================================
// MOBILE SIDEBAR TOGGLE
// ============================================

menuIcon.addEventListener("click", function() {
    sidebar.classList.toggle("open");
    overlay.classList.toggle("show");
});

overlay.addEventListener("click", () => {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
});

// ============================================
// TASK MANAGEMENT STATE
// ============================================

let tasks = [];                    
let currentText = "";           
let oldCategory = "";             
let editingID = null;             
let selectedCategory = "All Tasks"; 

// ============================================
// RENDER TASKS (DISPLAY TASKS IN UI)
// ============================================

function renderTasks() {
    // Filter tasks based on selected category
    let filteredTasks;
    
    if (selectedCategory === "All Tasks") {
        filteredTasks = tasks;
    } else {
        filteredTasks = tasks.filter(task => task.category === selectedCategory);
    }

    if (filteredTasks.length === 0) {
        speechBubble.style.display = "block";
        emptyMessage.style.display = "block";
        tasksListSection.innerHTML = "";
        updateStats(); 
        return;
    }
    
    speechBubble.style.display = "none";
    emptyMessage.style.display = "none";

    tasksListSection.innerHTML = "";
    filteredTasks.forEach((task, index) => {
        const taskCardSection = document.createElement("div");
        taskCardSection.classList.add("taskCardSection");
        const originalIndex = tasks.indexOf(task); 
        taskCardSection.dataset.index = originalIndex;
        
        const isCompleted = task.completed || false;
        const imgSrc = isCompleted ? "assets/images/icons8-checkmark-144.png" : "assets/images/icons8-hollow-red-circle-96.png";
        
        // Build task card HTML
        taskCardSection.innerHTML = `
            <div class="taskCardWrapper"> 
                <div class="taskCard">
                    <div class="taskHeader"> 
                        <button class="checkAction">
                            <img src="${imgSrc}" alt="status">
                        </button>
                        <p class="taskCardTitle">${task.title}</p>
                        <div class="taskCategory ${task.category}">${task.category}</div>
                    </div>
                    <div class="taskCardActions">
                        <button class="editAction"></button>
                        <button class="deleteAction"></button>
                    </div>
                </div>
            </div>
        `;
        tasksListSection.appendChild(taskCardSection);
    });
    updateStats(); 
}

// ============================================
// ADD NEW TASK
// ============================================

heroBanner.addEventListener("submit", (e) => {
    e.preventDefault();
    const taskInputValue = taskInput.value.trim();
    const categorySelectValue = categorySelect.value;
    
    if (!taskInputValue) {
        alert("please enter your name");
        return;
    }
    
    // Create new task object and add to tasks array
    const newTask = {
        title: taskInputValue,
        category: categorySelectValue,
        completed: false
    };
    tasks.push(newTask);
    renderTasks();
    taskInput.value = ""; 
});

// ============================================
// TASK ACTIONS: EDIT, DELETE, TOGGLE COMPLETE
// ============================================

tasksListSection.addEventListener("click", (event) => {
    const eventTarget = event.target;
    const taskSection = eventTarget.closest(".taskCardSection");
    if (!taskSection) return;

    const index = parseInt(taskSection.dataset.index);
    const taskCard = taskSection.querySelector(".taskCard");
    const taskTitle = taskCard.querySelector(".taskCardTitle");
    const taskCategory = taskCard.querySelector(".taskCategory");

    // ===== EDIT TASK =====
    if (eventTarget.classList.contains("editAction")) {
        if (editingID !== null && editingID !== index) {
            alert("Please finish the previous edit first.");
            return;
        }

        // Store original values for cancel functionality
        editingID = index;
        taskTitle.contentEditable = true;
        taskTitle.focus();
        currentText = tasks[index].title;
        oldCategory = tasks[index].category;

        // Change button styles for editing mode
        eventTarget.className = "saveAction";
        const deleteButton = taskCard.querySelector(".deleteAction");
        deleteButton.className = "cancelAction";

        // Replace category label with dropdown for editing
        const select = document.createElement("select");
        select.className = "taskCategorySelect";
        const categories = ["Work", "Health", "Activity", "Personal"];
        categories.forEach((cat) => {
            const option = document.createElement("option");
            option.value = cat;
            option.textContent = cat;
            if (cat === oldCategory) {
                option.selected = true;
            }
            select.appendChild(option);
        });
        taskCategory.replaceWith(select);
    }
    
    // ===== DELETE TASK =====
    else if (eventTarget.classList.contains("deleteAction")) {
        if (editingID !== null) {
            alert("Please finish editing first.");
            return;
        }
        if (confirm("Are you sure you want to delete this task?")) {
            tasks.splice(index, 1);
            editingID = null;
            currentText = "";
            oldCategory = "";
            renderTasks();
        }
    }

    // ===== SAVE EDITED TASK =====
    else if (eventTarget.classList.contains("saveAction")) {
        const newTitle = taskTitle.textContent.trim();
        if (!newTitle) {
            alert("The task title cannot be empty");
            return;
        }
        
        // Disable editing and restore button styles
        taskTitle.contentEditable = false;
        eventTarget.className = "editAction";
        const cancelButton = taskCard.querySelector(".cancelAction");
        cancelButton.className = "deleteAction";

        // Get new category from dropdown
        const select = taskCard.querySelector(".taskCategorySelect");
        const newCategoryValue = select.value;
        
        // Create new category label
        const newCategory = document.createElement("div");
        newCategory.className = `taskCategory ${newCategoryValue}`;
        newCategory.textContent = newCategoryValue;
        
        // Update task in array
        tasks[index] = {
            title: newTitle,
            category: newCategoryValue,
            completed: tasks[index].completed 
        };

        // Replace dropdown with new category label
        select.replaceWith(newCategory);
        editingID = null;
    }
    
    // ===== CANCEL EDIT =====
    else if (eventTarget.classList.contains("cancelAction")) {
        // Restore original values
        taskTitle.contentEditable = false;
        taskTitle.textContent = currentText;
        eventTarget.className = "deleteAction";
        const saveBtn = taskCard.querySelector(".saveAction");
        saveBtn.className = "editAction";

        // Restore original category
        const select = taskCard.querySelector(".taskCategorySelect");
        if (select) {
            const newCategory = document.createElement("div");
            newCategory.className = `taskCategory ${oldCategory}`;
            newCategory.textContent = oldCategory;
            select.replaceWith(newCategory);
        }
        editingID = null;
    }
    
    // ===== TOGGLE COMPLETE STATUS =====
    else if (eventTarget.closest(".checkAction")) {
        if (editingID !== null) {
            alert("Please finish editing first.");
            return;
        }
        
        // Toggle completion status
        tasks[index].completed = !tasks[index].completed;
        renderTasks();
        return;
    }
});

// ============================================
// CATEGORY FILTERING
// ============================================

const categoryItems = document.querySelectorAll(".categorieItems > div");

categoryItems.forEach((item) => {
    item.addEventListener("click", function() {
        const categoryName = this.querySelector("span").textContent;
        selectedCategory = categoryName;
        renderTasks(); // Re-render with new filter
    });
});

// ============================================
// UPDATE STATISTICS (Progress Board)
// ============================================

function updateStats() {
    // Apply current category filter to stats
    let filteredTasks;
    
    if (selectedCategory === "All Tasks") {
        filteredTasks = tasks;
    } else {
        filteredTasks = tasks.filter(task => task.category === selectedCategory);
    }
    
    // Calculate statistics
    const total = filteredTasks.length;
    const completed = filteredTasks.filter(task => task.completed === true).length;
    const incompleted = filteredTasks.filter(task => task.completed === false).length;

    // Update UI with calculated values
    completedCount.textContent = completed;
    incompleteCount.textContent = incompleted;
    totalCount.textContent = total;
}

// ============================================
// LOGOUT FUNCTIONALITY
// ============================================

logoutBtn.addEventListener("click", function() {
    // Confirm logout action
    if (!confirm("Are you sure you want to logout?")) {
        return;
    }
    
    // Clear user session
    localStorage.removeItem("username");

    // Clear tasks
    tasks = [];
    renderTasks();
    
    // Show auth section and hide main app
    authSection.style.display = "block";
    tasksparkMain.classList.add("hidden");
});