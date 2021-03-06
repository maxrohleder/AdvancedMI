import React, { Component } from "react";
import LoginForUser from "./components/loginForUser.js";
import { Link } from "react-router-dom";

import "./styles/login.css";

class Login extends Component {
  state = {};
  render() {
    return (
      <div className="login-img">
        <div className="login-main">
          <div className="login-header">
            Digitaler <span>Warteraum</span>
          </div>

          <div className="login-form">
            <LoginForUser />
          </div>

          <div className="login-footer">
            <Link to="/admin/registerAdmin">Admin</Link>
            <Link to="/impressum">Impressum</Link>
            <Link to="/agb">AGB</Link>
          </div>
        </div>
      </div>
    );
  }
}

export default Login;
