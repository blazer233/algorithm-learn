const creatRtc = (config = {}) => {
  const peer = new RTCPeerConnection(null);
  console.log("Created local peer connection object pc1");
  peer.onicecandidate = e => {
    peer.addIceCandidate(e.candidate).then(
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
  for (let i in config) {
    if (peer[i]) peer[i] = config[i];
  }
  return peer;
};
