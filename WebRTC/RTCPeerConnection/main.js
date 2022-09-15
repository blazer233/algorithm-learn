const startButton = document.getElementById("startButton");
const callButton = document.getElementById("callButton");
const hangupButton = document.getElementById("hangupButton");
const localVideo = document.getElementById("yours");
const remoteVideo = document.getElementById("theirs");

let localStream;
let localPc;
let remotePc;

callButton.disabled = true;
hangupButton.disabled = true;
startButton.onclick = async () => {
  /**
   * 获取本地媒体流
   */
  console.log("Requesting local stream");
  startButton.disabled = true;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    localVideo.srcObject = stream;
    localStream = stream;
    callButton.disabled = false;
  } catch (error) {
    alert("getUserMedia() error: " + e.name);
  }
};
callButton.onclick = () => {
  callButton.disabled = true;
  hangupButton.disabled = false;
  console.log("Starting call");
  localPc = creatRtc({
    otherPeer: () => remotePc,
    localStream,
    send: true,
  });
  remotePc = creatRtc({
    otherPeer: () => localPc,
    ontrack: e => {
      const [temp] = e.streams;
      if (remoteVideo.srcObject != temp) {
        remoteVideo.srcObject = temp;
        console.log("remotePc received remote stream");
      }
    },
  });
};
hangupButton.onclick = () => {
  console.log("Ending call");
  localPc.close();
  remotePc.close();
  localPc = null;
  remotePc = null;
  hangupButton.disabled = true;
  callButton.disabled = false;
};
