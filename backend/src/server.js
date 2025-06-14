const Koa = require('koa');
const cors = require('@koa/cors');
const bodyParser = require('koa-bodyparser');
const app = new Koa();
const http = require('http')

app.use(cors());
app.use(bodyParser());
const tickets = [
    {
        id: '1',
        name: 'Проблема с входом',
        description: 'Не могу войти в систему после обновления',
        status: false,
        created: new Date().toLocaleString()
    }
];

function generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 5);
}

app.use(async ctx => {
    const { method } = ctx.request.query;

    switch (method) {
        case 'allTickets':
            ctx.body = tickets.map(({ id, name, status, created,description}) => ({ id, name, status, created , description}));
            break;
        case 'ticketById':
            const id = ctx.request.query.id;
            const ticket = tickets.find(t => t.id === id);
            if (ticket) {
                ctx.body = ticket;
            } else {
                ctx.status = 404;
                ctx.body = { error: 'Ticket not found' };
            }
            break;
        case 'createTicket':

            const { name, description, status} = ctx.request.body;
            const newTicket = {
                id: generateId(),
                name,
                description,
                status: status === 'true' || status === true,
                created: new Date().toLocaleString()
            };
            tickets.push(newTicket);
            ctx.status = 201;
            ctx.body = newTicket;
            console.log(ctx.request.body);
            break;
        case 'updateTicket':
            const updateId = ctx.request.query.id;
            const index = tickets.findIndex(t => t.id === updateId);
            if (index !== -1) {
                const { name, description, status } = ctx.request.body;
                tickets[index] = {
                    ...tickets[index],
                    name,
                    description,
                    status: status === 'true' || status === true
                };
                ctx.body = tickets[index];
            } else {
                ctx.status = 404;
                ctx.body = { error: 'Ticket not found' };
            }
            break;
        case 'deleteTicket':
            const deleteId = ctx.request.query.id;
            const idx = tickets.findIndex(t => t.id === deleteId);
            if (idx !== -1) {
                tickets.splice(idx, 1);
                ctx.status = 204; // No Content
            } else {
                ctx.status = 404;
                ctx.body = { error: 'Ticket not found' };
            }
            break;
        default:
            ctx.status = 404;
            ctx.body = { error: 'Method not supported' };
    }
});
const server = http.createServer(app.callback());
const port = 7070
server.listen(port, (err) => {
    if (err) {
        console.log(err);
        return;
    }
    console.log('server is listening' + port);
})

