import React from 'react';

const DirectChatHeader = ({ activeConversation }) => {
  return (
    <div className='direct_chat_header'>
      <p className='direct_chat_header_paragraph'>
        {activeConversation ? activeConversation.identity : ''}
      </p>
    </div>
  );
};

export default DirectChatHeader;
