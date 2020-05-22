import React, { Component } from "react";
import LoginForAdmin from "./components/loginForAdmin.js";

import "./styles/LoginAdmin.css";
import { ReactComponent as Logo } from "./img/doctor-svgrepo-com.svg";

class LoginAdmin extends Component {
  state = {};
  render() {
    return (
      <div className="app">
        <div className="container-admin">
          <div className="name-admin">
            Digitaler <span>Warteraum</span>
          </div>
          <div className="container-bild">
            <Logo id="img" />
          </div>
          <LoginForAdmin />
        </div>
        <div className="container-bottom">
          {" "}
          <a href="http://localhost:3000">Patient</a>
          <a href="https://www.google.de">About</a>
          <a href="https://www.google.de">AGB</a>
        </div>
      </div>
    );
  }
}

export default LoginAdmin;
