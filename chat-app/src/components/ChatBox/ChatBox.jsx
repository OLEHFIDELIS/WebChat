import React from "react";
import "./ChatBox.css";
import assets from "../../assets/assets";

const ChatBox = () => {
  return (
    <div className="chatbox">
      <div className="chat-user">
        <img src={assets.profile_img} alt="" />
        <p>Richard Sanford <img className="dot" src={assets.green_dot} alt="" /></p>
        <img src={assets.help_icon} alt="" className="help" />
      </div>
    </div>
  );
};

export default ChatBox;