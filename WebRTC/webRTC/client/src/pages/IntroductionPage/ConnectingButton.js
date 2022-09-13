import React from 'react';

const ConnectingButton = ({
  createRoomButton = false,
  buttonText,
  onClickHandler,
}) => {
  //判断按钮样式
  const buttonClass = createRoomButton
    ? 'create_room_button'
    : 'join_room_button';
  return (
    <button className={buttonClass} onClick={onClickHandler}>
      {buttonText}
    </button>
  );
};

export default ConnectingButton;
