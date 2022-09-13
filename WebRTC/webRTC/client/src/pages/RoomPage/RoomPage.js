import React, { useEffect } from 'react';
import ChatSection from './ChatSection/ChatSection';
import ParticipantsSection from './ParticipantsSection/ParticipantsSection';
import RoomLabel from './RoomLabel';
import { connect } from 'react-redux';
import * as webRTCHandler from '../../utils/webRTCHandler';
import './Roompage.css';
import VideoSection from './VideoSection/VideoSection';
import Overlay from './Overlay';
const RoomPage = ({
  roomId,
  isRoomHost,
  identity,
  showOverlay,
  connectOnlyWithAudio,
}) => {
  useEffect(() => {
    //路由守卫
    if (!isRoomHost && !roomId) {
      // 动态获取接口
      const siteUrl = window.location.origin;
      // 设置当前定向到的URL
      window.location.href = siteUrl;
    }
    webRTCHandler.getLocalPreviewAndInitRoomConnection(
      isRoomHost,
      identity,
      roomId,
      connectOnlyWithAudio
    );
  }, []);

  return (
    <div className='room_container'>
      <ParticipantsSection />
      <VideoSection />
      <ChatSection />
      <RoomLabel roomId={roomId} />
      {showOverlay && <Overlay />}
    </div>
  );
};
const mapStateToProps = (state) => {
  return {
    ...state,
  };
};
export default connect(mapStateToProps)(RoomPage);
