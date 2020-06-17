import React, { Component } from "react";
import LoginForAdmin from "./components/loginForAdmin.js";
import { Link } from "react-router-dom";

class LoginAdmin extends Component {
  state = {};
  render() {
    return (
      <div className="login-img">
        <div className="login-main-admin">
          <div className="login-header">
            Digitaler <span>Warteraum</span> <br />
            ADMIN
          </div>
          <div className="login-form">
            <LoginForAdmin onAdminLoggedIn={this.props.onAdminLoggedIn} />
          </div>
          <div className="login-footer">
            <Link to="/">Patient</Link>
            <Link to="/impressum">Impressum</Link>
            <Link to="/agb">AGB</Link>
          </div>
        </div>
      </div>
    );
  }
}

export default LoginAdmin;
