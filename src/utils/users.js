const users = []; 

const addUser = ({id, username, room}) => {
    username = username.trim().toLowerCase();  
    room = room.trim().toLowerCase(); 

    //check for username and room
    if(!username || !room) {
        return {
            error: 'Username and room are required!'
        }
    }


   // Check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
}); 

    if(existingUser) {
        return {
            error: 'Username is in use'
        }
    }

    //save this user
    const user = {id , username, room}; 
    users.push(user); 
    return { user }; 
}; 

const removeUser = (id) => {
    const index = users.findIndex(user => user.id === id); 

    if(index !== -1) {
        return users.splice(index, 1)[0]; 
    }

}; 

const getUser = (id) => {
    return users.filter(user => user.id === id)[0];
}; 

const getUserInRoom = (room) => {
    room = room.trim().toLowerCase(); 
    return users.filter(user => user.room === room); 
}; 

// addUser({
//     id: 1, 
//     username: 'quangnc', 
//     room: '1'
// })

// addUser({
//     id: 2, 
//     username: 'quang', 
//     room: '1'
// })

// addUser({
//     id: 3, 
//     username: 'quangcong', 
//     room: '2'
// })


// console.log(users);

// // removeUser(1)

// // console.log(users);

// const user = getUser(2); 

// const room1 = getUserInRoom('1'); 


// console.log(user);

// console.log(room1);

module.exports = {
    addUser, 
    removeUser, 
    getUser, 
    getUserInRoom
}
