import React from 'react';
import { useNavigate } from 'react-router-dom';
const Button = ({ buttonText, cancelButton = false, onClickHandler }) => {
  const buttonClass = cancelButton
    ? 'join_room_cancel_button'
    : 'join_room_success_button';

  return (
    <button className={buttonClass} onClick={onClickHandler}>
      {buttonText}
    </button>
  );
};

const JoinRoomButtons = ({ handleJoinRoom, isRoomHost }) => {
  const successButtonText = isRoomHost ? '主持' : '加入';
  const navigate = useNavigate();
  //返回到介绍页面
  const pushToIntroductionPage = () => {
    navigate('/');
  };
  return (
    <div className='join_room_buttons_container'>
      <Button buttonText={successButtonText} onClickHandler={handleJoinRoom} />
      <Button
        buttonText='取消'
        onClickHandler={pushToIntroductionPage}
        cancelButton
      />
    </div>
  );
};

export default JoinRoomButtons;
