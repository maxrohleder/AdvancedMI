import React, { Component } from "react";
import LoginForAdmin from "./components/loginForAdmin.js";
import { Link } from "react-router-dom";

import "./styles/LoginAdmin.css";
import { ReactComponent as Logo } from "./img/doctor-svgrepo-com.svg";

class LoginAdmin extends Component {
  state = {};
  render() {
    return (
      <div className="app1">
        <div className="container-admin">
          <div className="name-admin">
            Digitaler <span>Warteraum</span>
          </div>
          <div className="container-bild">
            <Logo id="img" />
          </div>
          {console.log("inLoginAdmin: " + this.props.onAdminLoggedIn)}
          <LoginForAdmin onAdminLoggedIn={this.props.onAdminLoggedIn} />
        </div>
        <div className="container-bottom">
          <Link to="/">Patient</Link>
          <Link to="/impressum">Impressum</Link>
          <Link to="/agb">AGB</Link>
        </div>
      </div>
    );
  }
}

export default LoginAdmin;
