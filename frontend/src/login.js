import React, { Component } from "react";
import LoginForUser from "./components/loginForUser.js";

import "./styles/LoginUser.css";
import { ReactComponent as Logo } from "./img/doctor-svgrepo-com.svg";

class Login extends Component {
  state = {};
  render() {
    return (
      <div className="app">
        <div className="container-user">
          <div className="name-user">
            Digitaler <span>Warteraum</span>
          </div>
          <div className="container-bild">
            <Logo id="img" />
          </div>
          <LoginForUser />
        </div>
        <div className="container-bottom">
          {" "}
          <a href="http://localhost:3000/admin">Admin</a>
          <a href="http://localhost:3000/impressum">Impressum</a>
          <a href="https://www.google.de">AGB</a>
        </div>
      </div>
    );
  }
}

export default Login;
