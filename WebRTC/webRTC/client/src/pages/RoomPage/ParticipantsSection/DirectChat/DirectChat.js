import React, { useState, useEffect } from 'react';
import ConversationNotChosen from './ConversationNotChosen';
import DirectChatHeader from './DirectChatHeader';
import MessagesContainer from './MessagesContainer';
import NewMessage from './NewMessage';
import { connect } from 'react-redux';

//获取用户的历史记录
const getDirectChatHistory = (directChatHistory, socketId = null) => {
  //是否存在directChatHistory或者socketId
  if (!socketId || !directChatHistory) {
    return [];
  }

  const history = directChatHistory.find(
    (history) => history.socketId === socketId
  );

  return history ? history.chatHistory : [];
};

const DirectChat = ({ activeConversation, directChatHistory }) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    setMessages(
      getDirectChatHistory(
        directChatHistory,
        activeConversation ? activeConversation.socketId : null
      )
    );
  }, [activeConversation, directChatHistory]);
  return (
    <div className='direct_chat_container'>
      <DirectChatHeader activeConversation={activeConversation} />
      <MessagesContainer messages={messages} />
      <NewMessage />
      {!activeConversation && <ConversationNotChosen />}
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    ...state,
  };
};

export default connect(mapStateToProps)(DirectChat);
