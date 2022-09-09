export default (servers, config) => {
  const peer = new RTCPeerConnection(servers);
  const offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1,
  };
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
  peer.createOffer(offerOptions).then(config.createOffer);
  return peer;
};
