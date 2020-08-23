const socket = io();

// const incrementBtn = document.getElementById('increment'); 

// incrementBtn.addEventListener('click', () => {

//     socket.emit('incrementByOne'); 

// });

// socket.on('updateCount', (count) => {
//     console.log("Number of count: ", count);
// }); 

const formMessage = document.getElementById('form-message');
const messageFormInput = document.querySelector('input'); 
const messageFormButton = document.querySelector('button'); 
const shareLocationButton = document.getElementById('location-button'); 
const messages = document.getElementById('message'); 

//message template 

const messageTemplate = document.getElementById('message-template').innerHTML; 

//location template 

const locationTemplate = document.getElementById('location-template').innerHTML; 

const sidebarTemplate = document.getElementById('sidebar-template').innerHTML;  



//Query

const  { username , room } = Qs.parse(location.search, {ignoreQueryPrefix: true});
 

formMessage.addEventListener('submit', (e) => {
    e.preventDefault();

    messageFormButton.setAttribute('disabled', ''); 


    const message = e.target.message.value;

    socket.emit('sendMessage', message, (err) => {

        messageFormButton.removeAttribute('disabled');
        messageFormInput.value = '';  
        messageFormInput.focus()

        if (err) {
            return console.log(err);
        }
        // console.log('Message was delivered!');
    })
});


shareLocationButton.addEventListener('click', () => {

    if (!navigator.geolocation) {
        alert('Your browser does not support this feature!');
        return;
    }

    shareLocationButton.setAttribute('disabled', ''); 

    navigator.geolocation.getCurrentPosition(position => {
        // console.log(position);

        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            shareLocationButton.removeAttribute('disabled');
            // console.log('Location shared!'); 
        });
    });
});

const autoscroll = () => {
    // New message element
    const newMessage = messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle(newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = messages.offsetHeight

    // Height of messages container
    const containerHeight = messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = messages.scrollTop + visibleHeight
   

    if (containerHeight - newMessageHeight <= scrollOffset) {
        
        messages.scrollTop = messages.scrollHeight
    }
}

socket.on('message', (message) => {
    
    const html = Mustache.render(messageTemplate, 
    { 
        username: message.username,
        message: message.text, 
        createdAt: moment(message.createdAt).format('h:mm a')
    });

    messages.insertAdjacentHTML('beforeend', html);
    autoscroll();  
}); 

socket.on('location', (location) => {
    // console.log(location);
    const html = Mustache.render(locationTemplate, 
    {
        username: location.username,
        url: location.url, 
        createdAt: moment(location.createdAt).format('h:mm a')
     });

    messages.insertAdjacentHTML('beforeend', html);
    autoscroll(); 
}); 

socket.emit('join', {username, room}, (error) => {
    if(error) {
        alert(error); 
        location.href= "/"; 
    }
}); 

socket.on('room', ({room, users}) => {
    // console.log(users);
    // console.log(room);
    const html = Mustache.render(sidebarTemplate, {
        room: room, 
        users: users
    });

    document.getElementById('sidebar').innerHTML = html;  
});
