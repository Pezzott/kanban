document.addEventListener("DOMContentLoaded", function () {
    const sidebar = document.querySelector('.sidebar');
    const addTaskBtn = document.getElementById("add-task-btn");
    const taskModal = document.getElementById("task-modal");
    const closeBtn = document.querySelector(".close-button");
    const taskForm = document.getElementById("task-form");
    const kanbanColumns = document.querySelectorAll(".kanban-column");
    const cancelTaskBtn = document.getElementById("cancel-task-btn");
    cancelTaskBtn.addEventListener("click", function () {
        taskModal.style.display = "none";
    });

    window.addEventListener("click", function (event) {
        if (event.target === taskModal) {
            taskModal.style.display = "none";
        }
    });

    function generateId() {
        return Date.now().toString();
    }

    function loadTasks() {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('task_')) {
                const task = JSON.parse(localStorage.getItem(key));
                createTaskElement(task, key.split('_')[1]);
            }
        }
    }

    function createTaskElement(task, id) {
        const taskContainer = document.getElementById(task.status).querySelector('.tasks-container');
        const newTask = document.createElement('div');
        newTask.className = 'task';
        newTask.setAttribute('draggable', 'true');
        newTask.setAttribute('data-task-id', id);
        newTask.style.backgroundColor = getColorByStatus(task.status);

        newTask.innerHTML = `
    <h3 class="task-title">${task.title}</h3>
    <p class="task-desc">${task.description}</p>
    <p class="task-dates">Início: ${task.startDate || 'Não definido'} - Fim: ${task.endDate || 'Não definido'}</p>
    <p class="task-responsible">Responsável: ${task.responsible || 'Não definido'}</p>
`;

        const editButton = document.createElement('button');
        editButton.textContent = 'Editar';
        editButton.onclick = function () { openEditTask(id); };
        newTask.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Excluir';
        deleteButton.onclick = function () { confirmDeleteTask(id); };
        newTask.appendChild(deleteButton);

        taskContainer.appendChild(newTask);
        addDragEvents(newTask);
    }

    function addDragEvents(taskElement) {
        taskElement.addEventListener('dragstart', function (e) {
            e.dataTransfer.setData('text/plain', e.target.getAttribute('data-task-id'));
        });
    }

    function getColorByStatus(status) {
        const colors = {
            todo: '#ffcc00',
            inProgress: '#add8e6',
            completed: '#5cb85c'
        };
        return colors[status] || colors.todo;
    }

    function openEditTask(id) {
        const task = JSON.parse(localStorage.getItem('task_' + id));
        document.getElementById("task-id").value = id;
        document.getElementById("task-title").value = task.title;
        document.getElementById("task-desc").value = task.description;
        document.getElementById("task-start-date").value = task.startDate;
        document.getElementById("task-end-date").value = task.endDate;
        document.getElementById("task-responsible").value = task.responsible;
        taskModal.style.display = "flex";
    }

    function confirmDeleteTask(id) {
        if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
            deleteTask(id);
        }
    }

    function deleteTask(id) {
        localStorage.removeItem('task_' + id);
        const taskElement = document.querySelector(`[data-task-id="${id}"]`);
        taskElement.remove();
    }

    kanbanColumns.forEach(column => {
        column.addEventListener('dragover', function (e) {
            e.preventDefault();
        });

        column.addEventListener('drop', function (e) {
            e.preventDefault();
            const taskId = e.dataTransfer.getData('text/plain');
            const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
            const status = column.id;
            taskElement.style.backgroundColor = getColorByStatus(status);
            column.querySelector('.tasks-container').appendChild(taskElement);

            const task = JSON.parse(localStorage.getItem('task_' + taskId));
            task.status = status;
            localStorage.setItem('task_' + taskId, JSON.stringify(task));
        });
    });

    addTaskBtn.addEventListener("click", function () {
        taskModal.style.display = "flex";
        taskForm.reset();
        document.getElementById("task-id").value = generateId();
    });

    closeBtn.addEventListener("click", function () {
        taskModal.style.display = "none";
    });

    taskForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const taskTitle = document.getElementById("task-title").value;
        const taskDesc = document.getElementById("task-desc").value;
        const taskStartDate = document.getElementById("task-start-date").value;
        const taskEndDate = document.getElementById("task-end-date").value;
        const taskResponsible = document.getElementById("task-responsible").value;
        const taskId = document.getElementById("task-id").value;

        const task = {
            title: taskTitle,
            description: taskDesc,
            startDate: taskStartDate,
            endDate: taskEndDate,
            responsible: taskResponsible,
            status: 'todo'
        };

        if (localStorage.getItem('task_' + taskId)) {
            task.status = JSON.parse(localStorage.getItem('task_' + taskId)).status;
        } else {
            task.id = generateId();
        }

        localStorage.setItem('task_' + taskId, JSON.stringify(task));
        createTaskElement(task, taskId);
        taskModal.style.display = "none";
        loadTasks();
    });

    // Evento de clique na sidebar para alternar a visibilidade
    sidebar.addEventListener('click', function (event) {
        // Verifica se o clique foi diretamente na sidebar e não nos elementos internos
        if (event.target === sidebar) {
            sidebar.classList.toggle('sidebar-hidden');
        }
    });

    // Carregar as tarefas quando a página for carregada
    loadTasks();
});