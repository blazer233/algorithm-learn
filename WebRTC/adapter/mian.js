const startButton = document.getElementById("startButton");
const callButton = document.getElementById("callButton");
callButton.disabled = true;
startButton.addEventListener("click", start);
callButton.addEventListener("click", call);

const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");

let localStream;
let pc1;
let pc2;
const offerOptions = {
  offerToReceiveAudio: 1,
  offerToReceiveVideo: 1,
};

async function start() {
  /**
   * 获取本地媒体流
   */
  startButton.disabled = true;
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
  });
  localVideo.srcObject = stream;
  localStream = stream;
  callButton.disabled = false;
}

function gotRemoteStream(e) {
  if (remoteVideo.srcObject !== e.streams[0]) {
    remoteVideo.srcObject = e.streams[0];
    console.log("pc2 received remote stream");
    setTimeout(() => {
      pc1.getStats(null).then(stats => console.log(stats));
    }, 2000);
  }
}

function getName(pc) {
  return pc === pc1 ? "pc1" : "pc2";
}

function getOtherPc(pc) {
  return pc === pc1 ? pc2 : pc1;
}

async function call() {
  callButton.disabled = true;
  /**
   * 创建呼叫连接
   */
  pc1 = new RTCPeerConnection({
    sdpSemantics: "unified-plan", // 指定使用 unified plan
    iceServers: [
      { url: "stun:stun.l.google.com:19302" },
      { url: "turn:user@turnserver.com", credential: "pass" },
    ], // 配置ICE服务器
  });
  pc1.addEventListener("icecandidate", e => onIceCandidate(pc1, e)); // 监听ice候选项事件

  /**
   * 创建应答连接
   */
  pc2 = new RTCPeerConnection();

  pc2.addEventListener("icecandidate", e => onIceCandidate(pc2, e));
  pc2.addEventListener("track", gotRemoteStream);

  /**
   * 添加本地媒体流
   */
  localStream.getTracks().forEach(track => pc1.addTrack(track, localStream));

  /**
   * pc1 createOffer
   */
  const offer = await pc1.createOffer(offerOptions); // 创建offer
  await onCreateOfferSuccess(offer);
}

async function onCreateOfferSuccess(desc) {
  /**
   * pc1 设置本地sdp
   */
  await pc1.setLocalDescription(desc);

  /******* 以下以pc2为对方，来模拟收到offer的场景 *******/

  /**
   * pc2 设置远程sdp
   */
  await pc2.setRemoteDescription(desc);

  /**
   * pc2 createAnswer
   */
  const answer = await pc2.createAnswer(); // 创建answer
  await onCreateAnswerSuccess(answer);
}

async function onCreateAnswerSuccess(desc) {
  /**
   * pc2 设置本地sdp
   */
  await pc2.setLocalDescription(desc);

  /**
   * pc1 设置远程sdp
   */
  await pc1.setRemoteDescription(desc);
}

async function onIceCandidate(pc, event) {
  try {
    await getOtherPc(pc).addIceCandidate(event.candidate); // 设置ice候选项
    onAddIceCandidateSuccess(pc);
  } catch (e) {
    onAddIceCandidateError(pc, e);
  }
  console.log(
    `${getName(pc)} ICE candidate:\n${
      event.candidate ? event.candidate.candidate : "(null)"
    }`
  );
}

function onAddIceCandidateSuccess(pc) {
  console.log(`${getName(pc)} addIceCandidate success`);
}

function onAddIceCandidateError(pc, error) {
  console.log(
    `${getName(pc)} failed to add ICE Candidate: ${error.toString()}`
  );
}
