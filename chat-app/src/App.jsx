import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login/Login.jsx";
import ProfileUpdate from "./pages/ProfileUpdate/ProfileUpdate.jsx";
import Chat from "./pages/Chat/Chat.jsx";


const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/profile-update" element={<ProfileUpdate/>} />
        <Route path="/chat" element={<Chat/>} />
      </Routes>
    </>
  );
};

export default App;
