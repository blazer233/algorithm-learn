import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { connect } from 'react-redux';
import { setIsRootHost } from '../../store/actions';
import JoinRoomTitle from './JoinRoomTitle';
import './JoinRoomPage.css';
import JoinRoomContent from './JoinRoomContent';

const JoinRoomPage = (props) => {
  const { setIsRoomHostAction, isRoomHost } = props;
  //useLocaltion返回URL的location对象，search属性返回的是问号之后的查询字符串
  const search = useLocation().search;

  useEffect(() => {
    const isRoomHost = new URLSearchParams(search).get('host');

    if (isRoomHost) {
      //将主持人的状态保存到redux的store里面
      setIsRoomHostAction(isRoomHost);
    }
  }, []);
  return (
    <div className='join_room_page_container'>
      <div className='join_room_page_panel'>
        <JoinRoomTitle isRoomHost={isRoomHost} />
        <JoinRoomContent />
      </div>
    </div>
  );
};

//将 store 作为 props 绑定到组件上
const mapStateToProps = (state) => {
  return {
    ...state,
  };
};

//将 action 作为 props 绑定到组件上，
const mapActionsToProps = (dispatch) => {
  return {
    setIsRoomHostAction: (isRoomHost) => dispatch(setIsRootHost(isRoomHost)),
  };
};

//connect 方法，链接react组件与redux store，允许我们将 store 中的数据作为 props 绑定到组件上。
export default connect(mapStateToProps, mapActionsToProps)(JoinRoomPage);
