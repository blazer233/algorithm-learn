const creatRtc = (config = {}) => {
  const peer = new RTCPeerConnection(null);
  const offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
  };
  console.log("Created local peer connection object pc1");
  peer.onicecandidate = e => {
    const otherPeer = config.otherPeer();
    otherPeer.addIceCandidate(e.candidate).then(
      () => console.log(peer, "-----addIceCandidate success"),
      err => console.log(peer, "-----failed to add ICE Candidate:", err)
    );
    console.log(
      peer + " ICE candidate: \n" + (e.candidate ? e.candidate.candidate : "")
    );
  };
  peer.oniceconnectionstatechange = e => {
    console.log(peer + " ICE state: " + peer.iceConnectionState);
    console.log("ICE state change event: ", e);
  };
  if (config.localStream) {
    config.localStream
      .getTracks()
      .forEach(i => peer.addTrack(i, config.localStream));
    console.log("Added local stream to pc1");
    console.log("pc1 createOffer start");
  }
  if (config.send) {
    peer.createOffer(offerOptions).then(
      desc => {
        const otherPeer = config.otherPeer();
        console.warn("Offer from localPc\n", desc);
        console.log("localPc setLocalDescription start");
        peer.setLocalDescription(desc).then(
          () => console.log("localPc setLocalDescription complete"),
          err => console.log("localPc Failed description: " + err.toString())
        );
        console.log("remotePc setRemoteDescription start");
        console.warn(otherPeer);
        otherPeer.setRemoteDescription(desc).then(
          () => console.log("remotePc setLocalDescription complete"),
          err => console.log("remotePc Failed description: " + err.toString())
        );

        console.log("remotePc createAnswer start");
        otherPeer.createAnswer().then(
          desc => {
            console.warn("Answer from remotePc\n", desc);
            console.log("remotePc setLocalDescription start");
            otherPeer.setLocalDescription(desc);
            peer.setRemoteDescription(desc);
          },
          err =>
            console.log("otherPeer.createAnswer description: " + err.toString())
        );
      },
      err =>
        console.log("Failed to create session description: " + err.toString())
    );
  }
  if (config.ontrack) peer.ontrack = config.ontrack;
  return peer;
};
