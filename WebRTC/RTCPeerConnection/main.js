const startButton = document.getElementById("startButton");
const callButton = document.getElementById("callButton");
const hangupButton = document.getElementById("hangupButton");
let localStream;
let localPc;
let remotePc;

let startTime;
let localVideo = document.getElementById("yours");
let remoteVideo = document.getElementById("theirs");
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
      video: true
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
  startTime = window.performance.now();
  let videoTracks = localStream.getVideoTracks();
  let audioTracks = localStream.getAudioTracks();
  if (videoTracks.length > 0) {
    console.log("Using video device: " + videoTracks[0].label);
  }
  if (audioTracks.length > 0) {
    console.log("Using audio device: " + audioTracks[0].label);
  }
  localPc = creatRtc({
    otherPeer: () => remotePc,
    localStream,
    send: true
  });
  remotePc = creatRtc({
    otherPeer: () => localPc,
    ontrack: e => {
      const [temp] = e.streams;
      if (remoteVideo.srcObject != temp) {
        remoteVideo.srcObject = temp;
        console.log("remotePc received remote stream");
      }
    }
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

remoteVideo.onresize = () => {
  console.log(
    "Remote video size changed to " +
      remoteVideo.videoWidth +
      "x" +
      remoteVideo.videoHeight
  );
  // We'll use the first onsize callback as an indication that video has started
  // playing out.
  if (startTime) {
    let elapsedTime = window.performance.now() - startTime;
    console.log("Setup time: " + elapsedTime.toFixed(3) + "ms");
    startTime = null;
  }
};
