let users = [];

//join user to chat
function userJoin(peerId, socketId, roomId, userName) {
  // this.id = id;
  // this.username =username,
  // this.room =room
  // const user = { id, username, room };
  const user = { peerId, socketId, roomId, userName: userName };
  users.push(user);
  return user;
}

// get current user
function getCurrentUser(socketId) {
  return users.find((user) => user.socketId === socketId);
}

//User leaves
function userLeave(socketId) {
  // console.log(users);
  const index = users.findIndex((user) => user.socketId === socketId);
  console.log(index);
  // delete user leave
  if (index !== -1) {
    // console.log("user leave:");
    const userL = users.splice(index, 1);
    // console.log(userL);
    // console.log("users sau do:");
    // console.log(users);
    return userL[0];
  }
  return null;
}

//get users from Room
function getUsersRoom(room) {
  return users.filter((user) => user.roomId === roomId);
}
//get onLineUser
function getUsersOnline() {
  return users.length;
}
function getNameUsers() {
  let nameList = [];
  for (user of users) {
    nameList.push(user && user.userName);
  }
  console.log(nameList);
  return nameList;
}

module.exports = {
  getNameUsers,
  userJoin,
  getCurrentUser,
  userLeave,
  getUsersRoom,
  getUsersOnline,
};
