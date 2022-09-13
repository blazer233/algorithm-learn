import React from 'react';

//input组件
const Input = ({ placeholder, value, changeHandler }) => {
  return (
    <input
      placeholder={placeholder}
      value={value}
      onChange={changeHandler}
      className='join_room_input'
    />
  );
};

//inputs组件
const JoinRoomInputs = (props) => {
  const { roomIdValue, setRoomIdValue, nameValue, setNameValue, isRoomHost } =
    props;
  // 获取会议ID
  const handleRoomIdValueChange = (event) => {
    setRoomIdValue(event.target.value);
  };
  //获取用户姓名
  const handleNameValueChange = (event) => {
    setNameValue(event.target.value);
  };

  return (
    <div className='join_room_inputs_container'>
      {!isRoomHost && (
        <Input
          placeholder='请输入会议ID号...'
          value={roomIdValue}
          changeHandler={handleRoomIdValueChange}
        />
      )}
      <Input
        placeholder='请输你的姓名...'
        value={nameValue}
        changeHandler={handleNameValueChange}
      />
    </div>
  );
};

export default JoinRoomInputs;
