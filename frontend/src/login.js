import React, { Component } from "react";
import LoginForUser from "./components/loginForUser.js";
import { Link } from "react-router-dom";

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
          <Link to="/admin">Admin</Link>
          <Link to="/impressum">Impressum</Link>
          <Link to="/agb">AGB</Link>
        </div>
      </div>
    );
  }
}

export default Login;
