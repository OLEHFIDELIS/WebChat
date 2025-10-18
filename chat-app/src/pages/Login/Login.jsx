import React,{ useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./Login.css"
import assets from "../../assets/assets";

const Login = () => {

  const [currState, setCurrState] = useState("login");
  return (
    <div className="login">
      <img src={assets.logo_big} alt="" className="logo"/>
      <form className="login-form">
        <h2>Sign Up</h2>
        <input type="text" placeholder="username" className="form-input" required/>
        <input type="email" placeholder="Email address" className="form-input" required/>
        <input type="password" placeholder="password" className="form-input"/>
        <button className="form-button" type="submit">Sign Up</button>
        <div className="login-term">
          <input type="checkbox" />
          <p>Agree to the terms of use & privacy policy.</p>
        </div>
        <div className="login-forgot">
          <p className="login-toggle">Already have an account <span>click here</span></p>
        </div>
      </form>
    </div>
  );
};

export default Login;