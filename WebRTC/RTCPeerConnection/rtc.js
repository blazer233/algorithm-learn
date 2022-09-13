// https://www.jianshu.com/p/57fd3b5d2f80
// https://blog.csdn.net/weixin_40425640/article/details/124341142
// 数据地址 ICE
// 环境描述数据 SDP
const creatRtc = (config = {}) => {
  /**
   * 创建呼叫连接
   */
  const peer = new RTCPeerConnection(null);
  const offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
  };
  /**
   * 添加本地媒体流
   */
  if (config.localStream) {
    config.localStream
      .getTracks()
      .forEach(i => peer.addTrack(i, config.localStream));
    console.log("Added local stream to localPc");
  }
  if (config.send) {
    // 发起方创建和设置连接描述
    peer.createOffer(offerOptions).then(
      desc => {
        const otherPeer = config.otherPeer();
        /**
         * 1、 设置本地sdp
         */
        peer.setLocalDescription(desc);
        /**
         *  2、设置远程sdp
         */
        otherPeer.setRemoteDescription(desc);
        /**
         *  3、创建远程answer
         */
        otherPeer.createAnswer().then(desc => {
          /**
           * 4、设置远端电脑的本地sdp
           */
          otherPeer.setLocalDescription(desc);
          /**
           * 5、设置远端电脑的远端（本地）sdp
           */
          peer.setRemoteDescription(desc);
        });
      },
      err =>
        console.log("Failed to create session description: " + err.toString())
    );
    // 双方的信息交互完成sdp。这时候本地生成了自己的播放地址 也就是ice
  }
  peer.addEventListener("iceconnectionstatechange", () =>
    console.log(peer + " ICE state: " + peer.iceConnectionState)
  );
  /**
   * 创建应答连接，监听生成ice，添加到发起方，这样视频就连通了
   */
  peer.addEventListener("icecandidate", e => {
    const otherPeer = config.otherPeer();
    otherPeer.addIceCandidate(e.candidate).then(
      () => console.log(peer, "-----addIceCandidate success"),
      err => console.log(peer, "-----failed to add ICE Candidate:", err)
    );
    console.warn(
      peer + " ICE candidate: \n" + (e.candidate ? e.candidate.candidate : "")
    );
  });
  peer.addEventListener("track", e => config.ontrack && config.ontrack(e));

  return peer;
};
