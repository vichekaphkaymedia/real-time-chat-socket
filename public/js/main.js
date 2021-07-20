const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userLists = document.getElementById('users');

// get username and room from URL
const {username,room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});


const socket = io();

// join chat room
socket.emit('joinRoom',{username,room});

// get rooms and users
socket.on('roomUsers',({room,users}) => {
    outputRoomName(room);
    outputUsers(users);
})

socket.on('message',message => {
    outputMessage(message);

    // scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

chatForm.addEventListener('submit',(e) => {
    e.preventDefault();
    // get message
    const msg = e.target.elements.msg.value;

    // emit message to server
    socket.emit('chatMessage',msg);

    // clear message 
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});


const outputMessage = (message) => {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `
    <p class="meta">${message.username} &nbsp;<span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>
    `;
    document.querySelector('.chat-messages').appendChild(div);
}

const outputRoomName = (room) => {
    roomName.innerText = room;
}

const outputUsers = (users) => {
    users.map(user => {
        const li = document.createElement('li');
        li.innerHTML = user.username;
        userLists.appendChild(li);
    });
}