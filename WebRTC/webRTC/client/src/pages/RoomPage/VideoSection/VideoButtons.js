import React from 'react';
import CameraButton from './CameraButton';
import LeaveRoomButton from './LeaveRoomButton';
import MicButton from './MicButton';
import SwitchToScreenSharingButton from './SwitchToScreenSharingButton';
import { connect } from 'react-redux';
const VideoButtons = ({ connectOnlyWithAudio }) => {
  return (
    <div className='video_buttons_container'>
      <MicButton />
      {!connectOnlyWithAudio && <CameraButton />}
      <LeaveRoomButton />
      {!connectOnlyWithAudio && <SwitchToScreenSharingButton />}
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    ...state,
  };
};

export default connect(mapStateToProps)(VideoButtons);
