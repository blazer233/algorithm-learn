import React, { useState } from 'react';
import SendMessageButton from '../../../resources/images/sendMessageButton.svg';
import * as webRTCHandler from '../../../utils/webRTCHandler';
const NewMessage = () => {
  const [message, setMessage] = useState('');
  const handleTextChange = (event) => {
    setMessage(event.target.value);
  };
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();

      //发送消息给其他用户
      sendMessage();
    }
  };
  const sendMessage = () => {
    // console.log('发送消息给其他用户...');
    // console.log(message);
    //执行发送消息函数
    webRTCHandler.sendMessageUsingDataChannel(message);
    setMessage('');
  };
  return (
    <div className='new_message_container'>
      <input
        type='text'
        className='new_message_input'
        value={message}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        placeholder='请输入消息...'
      />
      <img
        className='new_message_button'
        src={SendMessageButton}
        onClick={sendMessage}
      />
    </div>
  );
};

export default NewMessage;
