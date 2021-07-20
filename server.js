const express = require('express');
const app = express();
const socketio = require('socket.io');
const {formatMessage} = require('./utils/messages')
const {getCurrentUser,userJoin,userLeave,getRoomUsers} = require('./utils/users')

const path = require('path');
const http = require('http');

const server = http.createServer(app)

const io = socketio(server)

app.use(express.static(path.join(__dirname,'public')));

const botName = 'ChatCort Bot';

io.on('connection', socket => {

    socket.on('joinRoom',({username,room}) => {
        const user = userJoin(socket.id,username,room);
        socket.join(user.room);
             
        socket.emit('message',formatMessage(botName,'Welcome to ChatCord!...'));

        // Broadcast when a user connects
        socket.broadcast.to(user.room).emit('message',formatMessage(botName,`${user.username} has joined the chat`));

        // send users and rooms
        io.to(user.room).emit('roomUsers',{
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    // listen for chatMessage
    socket.on('chatMessage',(msg) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message',formatMessage(user.username,msg))
    });

    // when user left
    socket.on('disconnect',() => {
        const user = userLeave(socket.id);

        if(user){
            io.to(user.room).emit('message',formatMessage(botName,`${user.username} has left the chat`))
        }
        
    });

    
    
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log("Server is running on port",PORT);
})