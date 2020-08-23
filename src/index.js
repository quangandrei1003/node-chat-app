const http = require('http');

const express = require('express');

const path = require('path');

const socketio = require('socket.io');

const Filter = require('bad-words');

const { generateMessage, generateLocationMessage } = require('./utils/message');

const { addUser, removeUser, getUser, getUserInRoom } = require('./utils/users.js');
const { get } = require('https');

const PORT = process.env.PORT || 3000;

const publicDirectory = path.join(__dirname, '../public');

// console.log(publicDirectory);

const app = express();

const server = http.createServer(app)

const io = socketio(server);

// serve static file
app.use(express.static(publicDirectory));

// let count = 0; 

// io.on('connection', (socket) => {
//      console.log('Connection!');

//      socket.emit('updateCount', count);

//      socket.on('incrementByOne', () => {
//          count++;
//          io.emit('updateCount', count)
//      }); 
// }); 

io.on('connection', (socket) => {
    console.log('New web socket connection');

    socket.on('join', ({ username, room }, callback) => {

        const { error, user } = addUser({ id: socket.id, username: username, room: room });

        if (error) {
            return callback(error);
        }

        socket.join(user.room);

        socket.emit('message', generateMessage('Leader 😎 ','Welcome'));
        socket.broadcast.to(user.room).emit('message', generateMessage(`Leader 😎`, `${user.username} has joined 👋!`));

        io.to(user.room).emit('room', {
            room: user.room, 
            users: getUserInRoom(user.room) 
        }); 

        callback();
    });

    socket.on('sendMessage', (message, callback) => {

        const user = getUser(socket.id); 

        const filter = new Filter();

        if (filter.isProfane(message)) {
            return callback('Profane words are not allowed!');
        }

        io.to(user.room).emit('message', generateMessage(user.username,message));

        callback();

    });

    socket.on('sendLocation', (coords, callback) => {

        const user = getUser(socket.id)

        io.emit('location', generateLocationMessage(user.username,`http://maps.google.com/?q=${coords.latitude},${coords.longitude}`));
        callback();
    });

    socket.on('disconnect', () => {

        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('message', generateMessage(`Leader 😎`,`${user.username} has left 😔`));
        
            io.to(user.room).emit('room', {
                room: user.room, 
                users: getUserInRoom(user.room) 
            });     
        }
    });
});

server.listen(PORT, () => {
    console.log(`App listening on ${PORT}`);
});



