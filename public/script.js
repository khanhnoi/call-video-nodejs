const videoGrid = document.getElementById("video-grid");
const btnCam = document.getElementById("onCam");
const inputMsg = document.getElementById("inputMessageId");
const muteBtnElm = $("#muteBtnId");
const stopBtnElm = $("#stopBtnId");
const chatBtnElm = $("#chatBtnId");
const leaveBtnElm = $("#leaveBtnId");
localStorage.setItem("chatWindow", false);
const chatStatus = true;
const socket = io("/");
const peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "5000" || "443",
});
const callList = []; //object
const sizeObj = (obj) => {
  let size = 0,
    key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) size++;
  }
  return size;
};
let myStreamVideoSave;

peer.on("open", function (peerId) {
  console.log("My peer ID is: " + peerId);
  myPeerId = peerId;
  const myName = localStorage.getItem("name") || "No Name";
  // titleTdElm.append(peerId);
  //because  const roomId = "<%= roomId %>"
  socket.emit("join-room", {
    roomId: roomId,
    peerId: peerId,
    userName: myName,
  });
});

// myVideoElm.muted = true;
// let myVideoStream;
// console.log(videoGrid);

OpenStream().then(function (myVideoStream) {
  myStreamVideoSave = myVideoStream;
  playVideoStream("myVideo", myVideoStream);

  socket.on("user-connected", (data) => {
    //anothorUserId is peerId
    const { anotherUserId } = data;
    console.log("New User Joind: " + anotherUserId);
    //send
    const call = peer.call(anotherUserId, myVideoStream, {
      metadata: { userId: peer.id },
    });
    //recevice
    call.on("stream", function (remoteStreamVideo) {
      // Show stream in some video/canvas element.
      if (!callList[call.peer]) {
        console.log("remote of send");
        playVideoStream(anotherUserId, remoteStreamVideo);
        callList[call.peer] = call;
        const totalVideo = sizeObj(callList) + 1;
        // if (totalVideo > 2) {
        //   const w = Math.floor(100 / totalVideo);
        //   $("video").css("width", `${w}%`);
        // }
      }
    });
  });
});

peer.on("call", function (call) {
  OpenStream().then((myVideoStream) => {
    myStreamVideoSave = myVideoStream;
    call.answer(myVideoStream); // Answer the call with an A/V stream.
    // console.log("answer");
    call.on("stream", function (remoteStreamVideo) {
      // Show stream in some video/canvas element.
      if (!callList[call.peer]) {
        callList[call.peer] = call;
        const totalVideo = sizeObj(callList) + 1;
        if (totalVideo > 6) return;

        console.log("remote of receive");
        const anotherUserId = call.peer;
        playVideoStream(anotherUserId, remoteStreamVideo);
      }
    });
  });
});

//build functions
function OpenStream() {
  return navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });
}

const playVideoStream = (videoElmClass, stream, userName) => {
  if (videoElmClass === "myVideo") {
    const newDiv = document.createElement("div");
    const newVideoElm = document.createElement("video");
    const newNameVideo = document.createElement("p");
    newNameVideo.setAttribute("class", "nameVideoId");
    newNameVideo.append(localStorage.getItem("name"));
    newDiv.append(newVideoElm);
    newDiv.append(newNameVideo);
    newDiv.setAttribute("class", videoElmClass);
    // newVideoElm.muted = true;
    newVideoElm.srcObject = stream;
    newVideoElm.addEventListener("loadedmetadata", () => {
      newVideoElm.play();
    });
    videoGrid.append(newDiv);
  } else {
    const newDiv = document.createElement("div");
    const newVideoElm = document.createElement("video");
    const newNameVideo = document.createElement("p");
    newNameVideo.setAttribute("class", "nameVideoId");
    newNameVideo.append(localStorage.getItem("name"));
    newDiv.append(newVideoElm);
    newDiv.append(newNameVideo);
    newDiv.setAttribute("class", videoElmClass);
    // newVideoElm.muted = true;
    newVideoElm.srcObject = stream;
    newVideoElm.addEventListener("loadedmetadata", () => {
      newVideoElm.play();
    });
    videoGrid.append(newDiv);
  }
};

socket.on("create-message", (data) => {
  const { msg, nameUser } = data;
  // console.log(nameUser);
  // console.log(msg);
  const msgWrapper = $("#messagesId");
  // console.log(msgWrapper);
  msgWrapper.append(`<li class="message">${nameUser}: ${msg}</li>`);
  scrollToBottom();
});

//build func
const scrollToBottom = () => {
  const chatWindowElm = $(".main__chatWindow");
  chatWindowElm.scrollTop(chatWindowElm.prop("scrollHeight"));
};

//actions client
//Actions - Jquery
$(document).ready(function () {
  muteBtnElm.click(handleOnMute);
  stopBtnElm.click(handleOnStop);
  chatBtnElm.click(handleOnChatWindow);
  leaveBtnElm.click(function () {
    window.location.href = "./";
  });

  const msgInput = $("#inputMessageId");
  // console.log(msg);
  $("html").keydown((e) => {
    if (e.which == 13 && msgInput.val().length !== 0) {
      socket.emit("message", { msg: msgInput.val(), socketId: socket.id });
      msgInput.val("");
    }
  });
});

const handleOnMute = () => {
  // console.log(myStreamVideoSave);
  if (myStreamVideoSave) {
    const enabled = myStreamVideoSave.getAudioTracks()[0].enabled;
    // console.log(enabled);
    if (enabled) {
      myStreamVideoSave.getAudioTracks()[0].enabled = false;
      setMuteIconButton(false);
    } else {
      myStreamVideoSave.getAudioTracks()[0].enabled = true;
      setMuteIconButton(true);
    }
  }
};

const handleOnStop = () => {
  if (myStreamVideoSave) {
    // myStreamVideoSave.getTracks().forEach((track) => track.stop());
    const enabled = myStreamVideoSave.getVideoTracks()[0].enabled;
    if (enabled) {
      myStreamVideoSave.getVideoTracks()[0].enabled = false;
      setStopIconButton(false);
    } else {
      myStreamVideoSave.getVideoTracks()[0].enabled = true;
      setStopIconButton(true);
    }
  }
};

const handleOnChatWindow = () => {
  let flag = localStorage.getItem("chatWindow");
  flag = flag === "false" ? false : true;
  // console.log(flag);
  setChatIconButton(!flag);
  displayChatWindow(!flag);
  localStorage.setItem("chatWindow", flag ? false : true);
};

const setChatIconButton = (flag) => {
  // console.log(flag);
  chatBtnElm.css({
    color: flag ? "#fff" : "#666",
    "text-shadow": flag ? " 0px 0px 5px #fff" : " 0px 0px 5px #666",
  });
};

const displayChatWindow = (flag) => {
  if (flag) {
    $(".main__rightChat").css("right", "0");
  } else {
    $(".main__rightChat").css("right", "-20vw");
  }
};
const setMuteIconButton = (flag) => {
  const htmlUnMute = `<i class="fa fa-microphone" aria-hidden="true"></i><span>Mute</span>`;
  const htmlMute = `<i class="fa fa-microphone-slash" aria-hidden="true"></i><span>UnMute</span>`;
  muteBtnElm.html(flag ? htmlUnMute : htmlMute);
  muteBtnElm.css({
    color: flag ? "#fff" : "red",
    "text-shadow": flag ? " 0px 0px 5px #fff" : " 0px 0px 5px red",
  });
};

const setStopIconButton = (flag) => {
  // console.log(flag);
  const htmlUnStop = `<i class="fa fa-video-camera" aria-hidden="true"></i>
  <span>Stop Video</span>`;
  const htmlStop = `<i class="fa fa-pause" aria-hidden="true"></i>
  <span>Play Video</span>`;
  stopBtnElm.html(flag ? htmlUnStop : htmlStop);
  stopBtnElm.css({
    color: flag ? "#fff" : "red",
    "text-shadow": flag ? " 0px 0px 5px #fff" : " 0px 0px 5px red",
  });
};

//room
socket.on("update-room", (data) => {
  const { totalUsers, peerIdUserDisconnect, nameUsers } = data;
  // console.log(" totalUsers");
  // console.log(totalUsers);
  console.log("nameUsers:");
  console.log(nameUsers);
  const nameUsersElm = document.getElementById("nameUsersId");
  let node,
    i = 0;
  nameUsersElm.innerHTML = "";
  for (nameUser of nameUsers) {
    let node = document.createElement("li"); // Create a <li> node
    let textnode = document.createTextNode(i + " - " + nameUser);
    i++;
    node.append(textnode);
    nameUsersElm.append(node);
  }

  //styles change
  if (totalUsers > 2) {
    $(".main__videos").addClass("w33");
    $(".main__videos").removeClass("w50");
  } else {
    $(".main__videos").removeClass("w33");
    $(".main__videos").addClass("w50");
  }
  //room change
  const htmlTotalUsers = `<i class="fa fa-users" aria-hidden="true"></i> <h5>Total Users: ${totalUsers}</h5>`;
  $(".main__totalUsers").html(htmlTotalUsers);

  //videos remove
  if (peerIdUserDisconnect) {
    $(`.${peerIdUserDisconnect}`).remove();
  }
});
