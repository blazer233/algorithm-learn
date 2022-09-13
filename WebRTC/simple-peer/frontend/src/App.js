import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import AssignmentIcon from '@material-ui/icons/Assignment';
import PhoneIcon from '@material-ui/icons/Phone';
import React, { useEffect, useRef, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Peer from 'simple-peer';
import io from 'socket.io-client';
import './App.css';

//客户端的socket连接
const socket = io.connect('http://localhost:5001');

function App() {
  //创建存储的状态
  const [stream, setStream] = useState();
  const [name, setName] = useState('');
  const [me, setMe] = useState('');
  const [idToCall, setIdToCall] = useState('');
  const [callAccepted, setCallAcceted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [receivingCall, setReceivingCall] = useState(false);
  const [userName, setUserName] = useState('');
  const [caller, setCaller] = useState('');
  const [callerSignal, setCallerSignal] = useState();
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
        console.log(stream);
        myVideo.current.srcObject = stream;
      })
      .catch((err) => {
        console.log(err);
      });

    socket.on('me', (id) => {
      setMe(id);
    });

    //接听方获取从服务器传递的发起方数据
    socket.on('callUser', (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setUserName(data.name);
      setCallerSignal(data.signal);
    });
  }, []);

  //向另一方拨打视频电话
  const callUser = (idTocall) => {
    //实例化对等连接对象
    const peer = new Peer({
      initiator: true,
      stream: stream,
      trickle: false,
    });
    //传递信令数据
    peer.on('signal', (data) => {
      socket.emit('callUser', {
        userToCall: idTocall,
        signalData: data,
        from: me,
        name: name,
      });
    });

    //获取对方的stream
    peer.on('stream', (stream) => {
      userVideo.current.srcObject = stream;
    });

    //当接听方同意通话后获取信令
    socket.on('callAccepted', (signal) => {
      setCallAcceted(true);
      peer.signal(signal);
    });

    //存储peer对象
    connectionRef.current = peer;
  };
  // 接听通话
  const answerCall = () => {
    setCallAcceted(true);
    const peer = new Peer({
      initiator: false,
      stream: stream,
      trickle: false,
    });

    peer.on('signal', (data) => {
      socket.emit('answerCall', {
        signal: data,
        to: caller,
      });
    });

    peer.on('stream', (stream) => {
      userVideo.current.srcObject = stream;
    });

    peer.signal(callerSignal);

    //存储peer对象
    connectionRef.current = peer;
  };

  //断开通信
  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current.destroy();
  };

  return (
    <>
      <h1 style={{ textAlign: 'center', color: '#fff' }}>视频聊天应用</h1>
      <div className='container'>
        {/* 视频容器 */}
        <div className='video-container'>
          <div className='video'>
            {stream && (
              <video
                playsInline
                muted
                autoPlay
                style={{ width: '500px' }}
                ref={myVideo}
              />
            )}
          </div>
          <div className='video'>
            {callAccepted && !callEnded ? (
              <video
                playsInline
                muted
                autoPlay
                style={{ width: '500px' }}
                ref={userVideo}
              />
            ) : null}
          </div>
        </div>
        {/* 输入面板 */}
        <div className='myId'>
          <TextField
            id='filled-basic'
            label='姓名'
            variant='filled'
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ marginBottom: '20px' }}
          />
          <CopyToClipboard text={me} style={{ marginBottom: '2rem' }}>
            <Button
              variant='contained'
              color='primary'
              startIcon={<AssignmentIcon fontSize='large' />}
            >
              我的通话ID
            </Button>
          </CopyToClipboard>
          <TextField
            id='filled-basic'
            label='请输入对方通话ID'
            variant='filled'
            value={idToCall}
            onChange={(e) => setIdToCall(e.target.value)}
          />
          <div className='call-button'>
            {/* 接收到通信但又没有挂断的情况下，显示button为结束通信，否则就显示电话图标 */}
            {callAccepted && !callEnded ? (
              <Button variant='contained' color='secondary' onClick={leaveCall}>
                结束通话
              </Button>
            ) : (
              <IconButton
                color='primary'
                aria-label='call'
                onClick={() => callUser(idToCall)}
              >
                <PhoneIcon fontSize='large' />
              </IconButton>
            )}
          </div>
        </div>
        {/* 同意接听 */}
        <div>
          {receivingCall && !callAccepted ? (
            <div className='caller'>
              <h1>{userName}正在呼叫...</h1>
              <Button variant='contained' color='primary' onClick={answerCall}>
                同意接听
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}

export default App;
