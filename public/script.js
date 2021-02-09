const videoGrid = document.getElementById("video-grid");
console.log(videoGrid);
const myVideoElm = document.createElement("video");

// myVideoElm.muted = true;

let myVideoStream;
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then(function (stream) {
    myVideoStream = stream;
    addVideoStream(myVideoElm, stream);
  });

const addVideoStream = (videoElm, stream) => {
  videoElm.srcObject = stream;
  videoElm.addEventListener("loadedmetadata", () => {
    videoElm.play();
  });
  videoGrid.append(videoElm);
};
