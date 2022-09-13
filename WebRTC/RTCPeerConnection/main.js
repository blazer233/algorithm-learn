const startButton = document.getElementById("startButton");
const callButton = document.getElementById("callButton");
const hangupButton = document.getElementById("hangupButton");
let localStream;
let pc1;
let pc2;
let offerOptions = {
  offerToReceiveAudio: 1,
  offerToReceiveVideo: 1
};
callButton.disabled = true;
hangupButton.disabled = true;
startButton.onclick = async () => {
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
  pc1 = creatRtc();
  localStream.getTracks().forEach(track => pc1.addTrack(track, localStream));
  console.log("Added local stream to pc1");
  console.log("pc1 createOffer start");
  pc1
    .createOffer(offerOptions)
    .then(onCreateOfferSuccess, onCreateSessionDescriptionError);

  pc2 = new RTCPeerConnection();
  console.log("Created remote peer connection object pc2");
  pc2.onicecandidate = function (e) {
    onIceCandidate(pc2, e);
  };
  pc2.oniceconnectionstatechange = function (e) {
    onIceStateChange(pc2, e);
  };
  pc2.ontrack = () => {
    if (remoteVideo.srcObject !== e.streams[0]) {
      remoteVideo.srcObject = e.streams[0];
      console.log("pc2 received remote stream");
    }
  };
};
hangupButton.onclick = hangup;

let startTime;
let localVideo = document.getElementById("yours");
let remoteVideo = document.getElementById("theirs");

remoteVideo.onresize = function () {
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

function getName(pc) {
  return pc === pc1 ? "pc1" : "pc2";
}

function getOtherPc(pc) {
  return pc === pc1 ? pc2 : pc1;
}

function onCreateSessionDescriptionError(error) {
  console.log("Failed to create session description: " + error.toString());
}

function onCreateOfferSuccess(desc) {
  console.log("Offer from pc1\n");
  console.log("pc1 setLocalDescription start");
  pc1.setLocalDescription(desc).then(function () {
    onSetLocalSuccess(pc1);
  }, onSetSessionDescriptionError);
  console.log("pc2 setRemoteDescription start");
  pc2.setRemoteDescription(desc).then(function () {
    onSetRemoteSuccess(pc2);
  }, onSetSessionDescriptionError);
  console.log("pc2 createAnswer start");
  // Since the 'remote' side has no media stream we need
  // to pass in the right constraints in order for it to
  // accept the incoming offer of audio and video.
  pc2
    .createAnswer()
    .then(onCreateAnswerSuccess, onCreateSessionDescriptionError);
}

function onSetLocalSuccess(pc) {
  console.log(getName(pc) + " setLocalDescription complete");
}

function onSetRemoteSuccess(pc) {
  console.log(getName(pc) + " setRemoteDescription complete");
}

function onSetSessionDescriptionError(error) {
  console.log("Failed to set session description: " + error.toString());
}

function onCreateAnswerSuccess(desc) {
  console.log("Answer from pc2:\n");
  console.log("pc2 setLocalDescription start");
  pc2.setLocalDescription(desc).then(function () {
    onSetLocalSuccess(pc2);
  }, onSetSessionDescriptionError);
  console.log("pc1 setRemoteDescription start");
  pc1.setRemoteDescription(desc).then(function () {
    onSetRemoteSuccess(pc1);
  }, onSetSessionDescriptionError);
}

function onIceCandidate(pc, event) {
  getOtherPc(pc)
    .addIceCandidate(event.candidate)
    .then(
      function () {
        onAddIceCandidateSuccess(pc);
      },
      function (err) {
        onAddIceCandidateError(pc, err);
      }
    );
  console.log(
    getName(pc) +
      " ICE candidate: \n" +
      (event.candidate ? event.candidate.candidate : "(null)")
  );
}

function onAddIceCandidateSuccess(pc) {
  console.log(getName(pc) + " addIceCandidate success");
}

function onAddIceCandidateError(pc, error) {
  console.log(
    getName(pc) + " failed to add ICE Candidate: " + error.toString()
  );
}

function onIceStateChange(pc, event) {
  if (pc) {
    console.log(getName(pc) + " ICE state: " + pc.iceConnectionState);
    console.log("ICE state change event: ", event);
  }
}

function hangup() {
  console.log("Ending call");
  pc1.close();
  pc2.close();
  pc1 = null;
  pc2 = null;
  hangupButton.disabled = true;
  callButton.disabled = false;
}
