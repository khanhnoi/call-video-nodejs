const videoGrid = document.getElementById("video-grid");
const btnCam = document.getElementById("onCam");
const socket = io("/");
const peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "5000",
});
let myStreamVideoSave;

peer.on("open", function (peerId) {
  console.log("My peer ID is: " + peerId);
  const titleTdElm = document.getElementById("peerId");
  titleTdElm.append(peerId);
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
    const call = peer.call(anotherUserId, myVideoStream);
    //recevice
    call.on("stream", function (remoteStreamVideo) {
      // Show stream in some video/canvas element.
      console.log("remote of send");
      playVideoStream("remoteVideo", remoteStreamVideo);
    });
  });
});

peer.on("call", function (call) {
  OpenStream().then((myVideoStream) => {
    call.answer(myVideoStream); // Answer the call with an A/V stream.
    call.on("stream", function (remoteStreamVideo) {
      // Show stream in some video/canvas element.
      console.log("remote of receive");
      playVideoStream("remoteVideo", remoteStreamVideo);
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

const playVideoStream = (videoElmId, stream) => {
  const remoteVideoElm = document.getElementById(videoElmId);
  if (!remoteVideoElm) {
    const newVideoElm = document.createElement("video");
    newVideoElm.setAttribute("id", videoElmId);
    newVideoElm.muted = true;
    newVideoElm.srcObject = stream;
    newVideoElm.addEventListener("loadedmetadata", () => {
      newVideoElm.play();
    });
    videoGrid.append(newVideoElm);
  } else {
    remoteVideoElm.srcObject = stream;
    remoteVideoElm.addEventListener("loadedmetadata", () => {
      remoteVideoElm.play();
    });
  }
};

const connectToNewServer = (anothorUserId, stream) => {
  //   console.log("New user has Id " + AnothorUserId);
  // Call a peer, providing our mediaStream
  //Phia nguoi Goi
  const call = peer.call(anothorUserId, stream);
  call.on("stream", (remoteVideoStream) => {
    // addVideoStream(newVideoElm, userVideoStream);
    console.log("Remote Video 1");
    playVideoStream2("remoteVideo", remoteVideoStream);
  });
};
