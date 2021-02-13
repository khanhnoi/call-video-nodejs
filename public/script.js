const videoGrid = document.getElementById("video-grid");
const btnCam = document.getElementById("onCam");
const inputMsg = document.getElementById("inputMessageId");
const muteBtnElm = $("#muteBtnId");
const stopBtnElm = $("#stopBtnId");
const chatBtnElm = $("#chatBtnId");
// localStorage.setItem("chatWindow", true);
const chatStatus = true;
const socket = io("/");
const peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "5000",
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
  const titleTdElm = document.getElementById("peerId");
  // titleTdElm.append(peerId);
  socket.emit("join-room", { roomId: roomId, peerId: peerId });
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
        playVideoStream("remoteVideo", remoteStreamVideo);
        callList[call.peer] = call;
        const totalVideo = sizeObj(callList) + 1;
        if (totalVideo > 2) {
          const w = Math.floor(100 / totalVideo);
          $("video").css("width", `${w}%`);
        }
      }
    });
  });
});

peer.on("call", function (call) {
  OpenStream().then((myVideoStream) => {
    myStreamVideoSave = myVideoStream;
    call.answer(myVideoStream); // Answer the call with an A/V stream.
    console.log("answer");
    call.on("stream", function (remoteStreamVideo) {
      // Show stream in some video/canvas element.
      if (!callList[call.peer]) {
        callList[call.peer] = call;
        const totalVideo = sizeObj(callList) + 1;
        if (totalVideo > 6) return;

        console.log("remote of receive");
        playVideoStream("remoteVideoReceive", remoteStreamVideo);

        if (totalVideo === 2 || totalVideo === 3) {
          const w = Math.floor(100 / totalVideo);
          $("video").css("width", `${w}%`);
        } else {
          $("video").css("width", `33%`);
        }
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

const playVideoStream = (videoElmClass, stream) => {
  if (videoElmClass === "myVideo") {
    const newVideoElm = document.createElement("video");
    newVideoElm.setAttribute("class", videoElmClass);
    // newVideoElm.muted = true;
    newVideoElm.srcObject = stream;
    newVideoElm.addEventListener("loadedmetadata", () => {
      newVideoElm.play();
    });
    videoGrid.append(newVideoElm);
  } else {
    const newVideoElm = document.createElement("video");
    newVideoElm.setAttribute("class", videoElmClass);
    // newVideoElm.muted = true;
    newVideoElm.srcObject = stream;
    newVideoElm.addEventListener("loadedmetadata", () => {
      newVideoElm.play();
    });
    videoGrid.append(newVideoElm);
  }
};

//Actions - Jquery
const msgInput = $("#inputMessageId");
// console.log(msg);
$("html").keydown((e) => {
  if (e.which == 13 && msgInput.val().length !== 0) {
    socket.emit("message", { msg: msgInput.val() });
    msgInput.val("");
  }
});

socket.on("create-message", (data) => {
  const { msg } = data;
  console.log(msg);
  const msgWrapper = $("#messagesId");
  console.log(msgWrapper);
  msgWrapper.append(`<li class="message">User: ${msg}</li>`);
  scrollToBottom();
});

//build func
const scrollToBottom = () => {
  const chatWindowElm = $(".main__chatWindow");
  chatWindowElm.scrollTop(chatWindowElm.prop("scrollHeight"));
};

//actions client

$(document).ready(function () {
  muteBtnElm.click(handleOnMute);
  stopBtnElm.click(handleOnStop);
  chatBtnElm.click(handleOnChatWindow);
});

const handleOnMute = () => {
  // console.log(myStreamVideoSave);
  if (myStreamVideoSave) {
    const enabled = myStreamVideoSave.getAudioTracks()[0].enabled;
    console.log(enabled);
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
  const flag = localStorage.getItem("chatWindow") || true;
  console.log(flag);
  setChatIconButton(flag);
};

const setChatIconButton = (flag) => {
  const htmlUnChat = `<i class="fa fa-comment" aria-hidden="true"></i>
  <span>Chat</span>`;
  const htmlChat = `<i class="fas fa-comment-slash" aria-hidden="true"></i>
  <span>UnChat</span>`;
  // chatBtnElm.html(flag === "true" ? htmlUnChat : htmlChat);
  chatBtnElm.css({
    color: flag === "true" ? "#fff" : "#666",
    "text-shadow": flag === "true" ? " 0px 0px 5px #fff" : " 0px 0px 5px #666",
  });
  localStorage.setItem("chatWindow", flag === "true" ? false : true);
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
