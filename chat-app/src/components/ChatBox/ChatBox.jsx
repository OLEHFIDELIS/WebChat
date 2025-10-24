import React from "react";
import "./ChatBox.css";

const ChatBox = () => {
  return (
    <div className="chatbox">
      <div className="chatbox-messages">
        {/* Messages will be displayed here */}
      </div>
      <div className="chatbox-input">
        <input type="text" placeholder="Type a message..." />
        <button>Send</button>
      </div>
    </div>
  );
};

export default ChatBox;