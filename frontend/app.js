let tasks = [];
let currentFilter = 'all';

const taskForm = document.getElementById('taskForm');
const taskList = document.getElementById('taskList');
const loadingElement = document.getElementById('loading');
const errorMessageElement = document.getElementById('errorMessage');
const noTasksElement = document.getElementById('noTasks');
const taskCountElement = document.getElementById('taskCount');
const activeCountElement = document.getElementById('activeCount');
const filterButtons = document.querySelectorAll('.filter-btn');
const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');
const editErrorElement = document.getElementById('editError');

function createSnowflakes() {
    const snowflakesContainer = document.getElementById('snowflakes');
    
    if (!snowflakesContainer) {
        console.error('Snowflakes container not found! Check HTML');
        return;
    }
    
    const snowflakeCount = 30;
    const snowflakeChars = ['❄', '❅', '❆', '✦', '*'];
    
    for (let i = 0; i < snowflakeCount; i++) {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        snowflake.textContent = snowflakeChars[Math.floor(Math.random() * snowflakeChars.length)];
        
        snowflake.style.left = Math.random() * 100 + 'vw';
        snowflake.style.fontSize = (0.5 + Math.random() * 1.5) + 'em';
        
        const duration = 3 + Math.random() * 7;
        const delay = Math.random() * 5;
        snowflake.style.animation = `fall ${duration}s linear ${delay}s infinite`;
        
        snowflake.style.opacity = 0.3 + Math.random() * 0.7;
        
        snowflakesContainer.appendChild(snowflake);
    }
    
    console.log('Snowflakes created:', snowflakesContainer.children.length);
}

function formatDate(dateString) {
    if (!dateString) return 'Без срока';
    
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
        return 'Сегодня';
    }
    
    if (date.toDateString() === tomorrow.toDateString()) {
        return 'Завтра';
    }
    
    return date.toLocaleDateString('ru-RU', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function getTimeLeftText(dateString) {
    if (!dateString) return '';
    
    const deadline = new Date(dateString);
    const today = new Date();
    const timeDiff = deadline - today;
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) {
        return `${Math.abs(daysLeft)} ${getDayWord(Math.abs(daysLeft))} просрочено`;
    } else if (daysLeft === 0) {
        return 'Сегодня';
    } else if (daysLeft === 1) {
        return 'Завтра';
    } else {
        return `Осталось ${daysLeft} ${getDayWord(daysLeft)}`;
    }
}

function getDayWord(number) {
    if (number % 10 === 1 && number % 100 !== 11) return 'день';
    if (number % 10 >= 2 && number % 10 <= 4 && (number % 100 < 10 || number % 100 >= 20)) return 'дня';
    return 'дней';
}

function getDeadlineStatus(task) {
    if (task.is_done) {
        return 'deadline-completed';
    }
    
    if (!task.deadline) {
        return 'deadline-normal';
    }
    
    const deadline = new Date(task.deadline);
    const today = new Date();
    const timeDiff = deadline - today;
    const daysLeft = timeDiff / (1000 * 60 * 60 * 24);
    
    if (daysLeft < 0) {
        return 'deadline-overdue';
    } else if (daysLeft <= 1) {
        return 'deadline-near';
    } else {
        return 'deadline-normal';
    }
}

function getDeadlineStatusText(task) {
    if (task.is_done) return 'Выполнено';
    if (!task.deadline) return 'Без срока';
    if (task.is_nearing_deadline) return 'Срочно';
    
    const deadline = new Date(task.deadline);
    const today = new Date();
    if (deadline < today) return 'Просрочено';
    return 'По плану';
}

function filterTasks(taskList, filter) {
    switch (filter) {
        case 'active':
            return taskList.filter(task => !task.is_done);
        case 'completed':
            return taskList.filter(task => task.is_done);
        case 'near-deadline':
            return taskList.filter(task => 
                !task.is_done && 
                task.deadline && 
                task.is_nearing_deadline
            );
        default:
            return taskList;
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function renderTasks() {
    taskList.innerHTML = '';
    
    const filteredTasks = filterTasks(tasks, currentFilter);
    
    const totalTasks = tasks.length;
    const activeTasks = tasks.filter(task => !task.is_done).length;
    
    taskCountElement.textContent = `${totalTasks} ${getTaskWord(totalTasks)}`;
    activeCountElement.textContent = `${activeTasks} активных`;
    
    if (filteredTasks.length === 0) {
        noTasksElement.classList.remove('hidden');
        taskList.classList.add('hidden');
    } else {
        noTasksElement.classList.add('hidden');
        taskList.classList.remove('hidden');
    }
    
    filteredTasks.forEach(task => {
        const taskItem = document.createElement('li');
        taskItem.className = `task-item ${task.is_done ? 'completed' : ''}`;
        taskItem.dataset.id = task.id;
        
        const deadlineStatus = getDeadlineStatus(task);
        const statusText = getDeadlineStatusText(task);
        const timeLeftText = getTimeLeftText(task.deadline);
        const formattedDate = formatDate(task.created_at);
        const deadlineDate = formatDate(task.deadline);
        
        taskItem.innerHTML = `
            <div class="task-header">
                <div class="checkbox-label">
                    <input type="checkbox" ${task.is_done ? 'checked' : ''} 
                           onclick="toggleTask(${task.id}, this.checked)">
                    <span class="task-title">${escapeHtml(task.title)}</span>
                </div>
                <div class="task-actions">
                    <button class="btn btn-small" onclick="openEditModal(${task.id})">
                        <i class="fas fa-edit"></i> Изменить
                    </button>
                    <button class="btn btn-small btn-danger" onclick="deleteTask(${task.id})">
                        <i class="fas fa-trash"></i> Удалить
                    </button>
                </div>
            </div>
            
            <div class="task-body">
                ${task.description ? `<p class="task-description">${escapeHtml(task.description)}</p>` : ''}
                
                <div class="task-meta">
                    <div class="task-date">
                        <i class="far fa-calendar-plus"></i>
                        <span>Создано: ${formattedDate}</span>
                    </div>
                    
                    ${task.deadline ? `
                        <div class="task-date">
                            <i class="far fa-calendar-check"></i>
                            <span>Срок: ${deadlineDate}</span>
                            <span class="time-left">(${timeLeftText})</span>
                        </div>
                    ` : ''}
                    
                    <span class="status-badge ${deadlineStatus}">
                        <i class="fas fa-${deadlineStatus === 'deadline-completed' ? 'check' : 
                                          deadlineStatus === 'deadline-overdue' ? 'exclamation-triangle' : 
                                          deadlineStatus === 'deadline-near' ? 'clock' : 'calendar'}"></i>
                        ${statusText}
                    </span>
                </div>
            </div>
        `;
        
        taskList.appendChild(taskItem);
    });
}

function getTaskWord(number) {
    if (number % 10 === 1 && number % 100 !== 11) return 'задача';
    if (number % 10 >= 2 && number % 10 <= 4 && (number % 100 < 10 || number % 100 >= 20)) return 'задачи';
    return 'задач';
}

async function loadTasks() {
    try {
        loadingElement.classList.remove('hidden');
        errorMessageElement.classList.add('hidden');
        
        tasks = await api.getTasks();
        renderTasks();
    } catch (error) {
        showError(`Ошибка загрузки задач: ${error.message}`);
    } finally {
        loadingElement.classList.add('hidden');
    }
}

async function addTask(event) {
    event.preventDefault();
    
    const titleInput = document.getElementById('title');
    const descriptionInput = document.getElementById('description');
    const deadlineInput = document.getElementById('deadline');
    const formError = document.getElementById('formError');
    
    formError.textContent = '';
    
    if (!titleInput.value.trim()) {
        formError.textContent = 'Название обязательно';
        titleInput.focus();
        return;
    }
    
    if (deadlineInput.value) {
        const deadlineDate = new Date(deadlineInput.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (deadlineDate < today) {
            formError.textContent = 'Срок не может быть в прошлом';
            deadlineInput.focus();
            return;
        }
    }
    
    try {
        const taskData = {
            title: titleInput.value.trim(),
            description: descriptionInput.value.trim() || null,
            deadline: deadlineInput.value || null
        };
        
        const newTask = await api.createTask(taskData);
        tasks.unshift(newTask);
        renderTasks();
        
        titleInput.value = '';
        descriptionInput.value = '';
        deadlineInput.value = '';
        titleInput.focus();
        
    } catch (error) {
        formError.textContent = `Ошибка создания задачи: ${error.message}`;
    }
}

async function toggleTask(taskId, isDone) {
    try {
        const updatedTask = await api.updateTask(taskId, { is_done: isDone });
        
        const index = tasks.findIndex(task => task.id === taskId);
        if (index !== -1) {
            tasks[index] = updatedTask;
            renderTasks();
        }
    } catch (error) {
        showError(`Ошибка обновления задачи: ${error.message}`);
    }
}

async function openEditModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    document.getElementById('editId').value = task.id;
    document.getElementById('editTitle').value = task.title;
    document.getElementById('editDescription').value = task.description || '';
    document.getElementById('editIsDone').checked = task.is_done;
    
    if (task.deadline) {
        const date = new Date(task.deadline);
        document.getElementById('editDeadline').value = date.toISOString().split('T')[0];
    } else {
        document.getElementById('editDeadline').value = '';
    }
    
    editErrorElement.textContent = '';
    editModal.classList.remove('hidden');
}

async function saveTaskEdit(event) {
    event.preventDefault();
    
    const taskId = parseInt(document.getElementById('editId').value);
    const title = document.getElementById('editTitle').value.trim();
    const description = document.getElementById('editDescription').value.trim();
    const deadline = document.getElementById('editDeadline').value;
    const isDone = document.getElementById('editIsDone').checked;
    
    if (!title) {
        editErrorElement.textContent = 'Название обязательно';
        return;
    }
    
    if (deadline) {
        const deadlineDate = new Date(deadline);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (deadlineDate < today) {
            editErrorElement.textContent = 'Срок не может быть в прошлом';
            return;
        }
    }
    
    try {
        const updateData = {
            title: title,
            description: description || null,
            is_done: isDone,
            deadline: deadline || null
        };
        
        const updatedTask = await api.updateTask(taskId, updateData);
        
        const index = tasks.findIndex(task => task.id === taskId);
        if (index !== -1) {
            tasks[index] = updatedTask;
            renderTasks();
        }
        
        closeEditModal();
    } catch (error) {
        editErrorElement.textContent = `Ошибка обновления задачи: ${error.message}`;
    }
}

function closeEditModal() {
    editModal.classList.add('hidden');
    editForm.reset();
}

async function deleteTask(taskId) {
    if (!confirm('Вы уверены, что хотите удалить эту задачу?')) {
        return;
    }
    
    try {
        await api.deleteTask(taskId);
        tasks = tasks.filter(task => task.id !== taskId);
        renderTasks();
    } catch (error) {
        showError(`Ошибка удаления задачи: ${error.message}`);
    }
}

function showError(message) {
    errorMessageElement.textContent = message;
    errorMessageElement.classList.remove('hidden');
    
    setTimeout(() => {
        errorMessageElement.classList.add('hidden');
    }, 5000);
}

function changeFilter(filter) {
    currentFilter = filter;
    
    filterButtons.forEach(btn => {
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    renderTasks();
}

function initializeDateInputs() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('deadline').min = today;
    document.getElementById('editDeadline').min = today;
}

async function init() {
    initializeDateInputs();
    
    taskForm.addEventListener('submit', addTask);
    editForm.addEventListener('submit', saveTaskEdit);
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            changeFilter(button.dataset.filter);
        });
    });
    
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', closeEditModal);
    });
    
    editModal.addEventListener('click', (event) => {
        if (event.target === editModal) {
            closeEditModal();
        }
    });

    createSnowflakes();
    
    await loadTasks();
}

window.toggleTask = toggleTask;
window.openEditModal = openEditModal;
window.deleteTask = deleteTask;

document.addEventListener('DOMContentLoaded', init);