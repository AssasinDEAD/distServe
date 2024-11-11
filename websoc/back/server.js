// back/server.js
const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8000 });

let users = new Map();

server.on('connection', (ws) => {
    let username = null;

    ws.on('message', (message) => {
        const parsedMessage = JSON.parse(message);
        
        switch(parsedMessage.type) {
            case 'connect':
                username = parsedMessage.username;
                users.set(username, ws);
                broadcast({ type: 'notification', content: `${username} присоединился к чату` });
                break;
            case 'message':
                broadcast({ type: 'message', username: username, content: parsedMessage.content });
                break;
            case 'disconnect':
                users.delete(username);
                broadcast({ type: 'notification', content: `${username} покинул чат` });
                break;
        }
    });

    ws.on('close', () => {
        if (username) {
            users.delete(username);
            broadcast({ type: 'notification', content: `${username} покинул чат` });
        }
    });

    function broadcast(data) {
        users.forEach(user => user.send(JSON.stringify(data)));
    }
});
