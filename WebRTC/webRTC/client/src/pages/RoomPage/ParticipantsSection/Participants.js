import React from 'react';
import { setActiveConversation } from '../../../store/actions';
import { connect } from 'react-redux';

const SingelParticipant = (props) => {
  const {
    identity,
    lastItem,
    participant,
    setActiveConversationAction,
    socketId,
  } = props;

  //激活私信聊天，获取对象信息
  const handleOpenActiveConversation = () => {
    if (participant.socketId !== socketId) {
      setActiveConversationAction(participant);
    }
  };
  return (
    <>
      <p
        className='participants_paragraph'
        onClick={handleOpenActiveConversation}
      >
        {identity}
      </p>
      {!lastItem && <span className='participants_separator_line'></span>}
    </>
  );
};

const Participants = ({
  participants,
  setActiveConversationAction,
  socketId,
}) => {
  return (
    <div className='participants_container'>
      {participants.map((participant, index) => {
        return (
          <SingelParticipant
            identity={participant.identity}
            lastItem={participants.length === index + 1}
            participant={participant}
            key={participant.identity}
            setActiveConversationAction={setActiveConversationAction}
            socketId={socketId}
          />
        );
      })}
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    ...state,
  };
};

const mapActionsToProps = (dispatch) => {
  return {
    setActiveConversationAction: (activeConversation) => {
      dispatch(setActiveConversation(activeConversation));
    },
  };
};

export default connect(mapStateToProps, mapActionsToProps)(Participants);
