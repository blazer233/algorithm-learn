import React, { useEffect } from 'react';
import logo from '../../resources/images/logo.png';
import ConnectingButtons from './ConnectingButtons';
import './IntroductionPage.css';
import { connect } from 'react-redux';
import { setIsRootHost } from '../../store/actions';
const IntroductionPage = ({ setIsRoomHostAction }) => {
  //默认host状态为false
  useEffect(() => {
    setIsRoomHostAction(false);
  }, []);

  return (
    <div className='introduction_page_container'>
      <div className='introduction_page_panel'>
        <img src={logo} className='introduction_page_image' />
        <ConnectingButtons />
      </div>
    </div>
  );
};

const mapActionsToProps = (dispatch) => {
  return {
    setIsRoomHostAction: (isRoomHost) => dispatch(setIsRootHost(isRoomHost)),
  };
};
export default connect(null, mapActionsToProps)(IntroductionPage);
