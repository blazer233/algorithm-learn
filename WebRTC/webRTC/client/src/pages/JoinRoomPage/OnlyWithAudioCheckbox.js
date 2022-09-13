import React from 'react';
import CheckImg from '../../resources/images/check.png';
const OnlyWithAudioCheckbox = ({
  setConnectOnlyWithAudio,
  connectOnlyWithAudio,
}) => {
  const handleConnectionTypeChange = () => {
    //将连接的状态类型存储到store当中
    setConnectOnlyWithAudio(!connectOnlyWithAudio);
  };
  return (
    <div className='checkbox_container'>
      <div className='checkbox_connection' onClick={handleConnectionTypeChange}>
        {connectOnlyWithAudio && (
          <img className='checkbox_image' src={CheckImg} />
        )}
      </div>
      <p className='checkbox_container_paragraph'>只开启音频</p>
    </div>
  );
};

export default OnlyWithAudioCheckbox;
