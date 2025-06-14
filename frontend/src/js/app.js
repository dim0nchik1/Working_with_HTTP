const apiBase = 'http://localhost:7070';

const ticketsListEl = document.getElementById('ticketsList');
const addBtn = document.getElementById('addTicketBtn');
const modal = document.getElementById('ticketModal');
const deleteModal = document.getElementById('deleteModal');
const loadingEl = document.getElementById('loading');

const form = document.getElementById('ticketForm');
const ticketIdInput = document.getElementById('ticketId');
const ticketNameInput = document.getElementById('ticketName');
const ticketDescriptionInput = document.getElementById('ticketDescription');
const ticketStatusInput = document.getElementById('ticketStatus');

const modalTitle = document.getElementById('modalTitle');


let tickets = [];
let ticketToDeleteId = null;

// Функции для отображения/скрытия модалок
function openModal(modalEl) {
    modalEl.style.display = 'flex';
}
function closeModal(modalEl) {
    modalEl.style.display = 'none';
}


// Загрузка списка тикетов
async function loadTickets() {
    showLoading(true);
    try {
        const response = await fetch(`${apiBase}/?method=allTickets`);
        tickets = await response.json()
        renderTickets();
    } catch (e) {
        alert('Ошибка загрузки данных');
    } finally {
        showLoading(false);
    }
}

// Отрисовка списка
function renderTickets() {
    ticketsListEl.innerHTML = '';
    tickets.forEach(ticket => {
        const li = document.createElement('li');
        li.className = 'ticket';

        const date = document.createElement('span');
        date.className = 'date';
        date.innerHTML = `${ticket.created}`;
        li.appendChild(date);

        const title = document.createElement('div');
        title.innerHTML = `<strong>${ticket.name}</strong>`;
        title.className = 'title';

        title.style.cursor = 'pointer';
        title.onclick = () => showTicketDetails(ticket.id);
        li.appendChild(title);


        const statusBtn = document.createElement('button');
        statusBtn.textContent = ticket.status ? '✓ ' : "X";
        statusBtn.className = 'statusBtn';
        statusBtn.onclick = () => toggleStatus(ticket.id);
        li.appendChild(statusBtn);

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'actions';

        const editBtn = document.createElement('button');
        editBtn.innerHTML = '✎';
        editBtn.title = 'Редактировать';
        editBtn.className = 'statusBtn';
        editBtn.onclick = () => openEditModal(ticket);
        actionsDiv.appendChild(editBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = 'x';
        deleteBtn.title = 'Удалить';
        deleteBtn.className = 'statusBtn';
        deleteBtn.onclick = () => openDeleteModal(ticket.id);
        actionsDiv.appendChild(deleteBtn);

        li.appendChild(actionsDiv);
        ticketsListEl.appendChild(li);
    });
}

// Показать детали
async function showTicketDetails(id) {
    const ticket = tickets.find(t => t.id === id);
    if (!ticket) return;
    alert(`Описание:\n${ticket.description}`);
}

// Переключение статуса
async function toggleStatus(id) {
    const ticket = tickets.find(t => t.id === id);
    if (!ticket) return;

    // Обновляем на сервере
    await fetch(`${apiBase}/?method=updateTicket&id=${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: ticket.name,
            description: ticket.description,
            status: !ticket.status
        })
    });
    await loadTickets();
}

// Открытие  для добавления
addBtn.onclick = () => {
    modalTitle.textContent = 'Создать новый тикет';
    form.reset();
    document.getElementById('ticketId').value = '';
    openModal(modal);
};

// Открытие для редактирования
function openEditModal(ticket) {
    modalTitle.textContent = 'Редактировать тикет';
    document.getElementById('ticketId').value = ticket.id;
    document.getElementById('ticketName').value = ticket.name;
    document.getElementById('ticketDescription').value = ticket.description;
    document.getElementById('ticketStatus').checked = ticket.status;
    openModal(modal);
}

// Обработка формы сохранения
form.onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('ticketId').value;
    const name = document.getElementById('ticketName').value;
    const description = document.getElementById('ticketDescription').value;
    const status = document.getElementById('ticketStatus').checked;

    if (id) {
        // Обновление
        await fetch(`${apiBase}/?method=updateTicket&id=${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description, status })
        });
    } else {
        // Создание
        await fetch(`${apiBase}/?method=createTicket`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description, status })
        });
    }
    closeModal(modal);
    await loadTickets();
};

document.getElementById('cancelBtn').onclick = () => closeModal(modal);

// Удаление
function openDeleteModal(id) {
    ticketToDeleteId = id;
    openModal(deleteModal);
}
document.getElementById('confirmDeleteBtn').onclick = async () => {
    if (ticketToDeleteId) {
        await fetch(`${apiBase}/?method=deleteTicket&id=${ticketToDeleteId}`, {
            method: 'POST'
        });
        ticketToDeleteId = null;
        closeModal(deleteModal);
        await loadTickets();
    }
};
document.getElementById('cancelDeleteBtn').onclick = () => {
    ticketToDeleteId = null;
    closeModal(deleteModal);
};

// Показывать/скрывать лоадер
function showLoading(show) {
    loadingEl.style.display = show ? 'block' : 'none';
}

// Инициализация
loadTickets();