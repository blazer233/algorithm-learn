import React, { useState } from 'react';

import CameraButtonImg from '../../../resources/images/camera.svg';
import CameraButtonImgOff from '../../../resources/images/cameraOff.svg';
import * as webRTCHandler from '../../../utils/webRTCHandler';

const CameraButton = () => {
  const [isLcoalVideoDisabled, setIsLcoalVideoDisabled] = useState(false);

  const handleCameraButtonPressed = () => {
    webRTCHandler.toggleCamera(isLcoalVideoDisabled);
    setIsLcoalVideoDisabled(!isLcoalVideoDisabled);
  };
  return (
    <div className='video_button_container'>
      <img
        src={isLcoalVideoDisabled ? CameraButtonImgOff : CameraButtonImg}
        onClick={handleCameraButtonPressed}
        className='video_button_image'
      />
    </div>
  );
};

export default CameraButton;
