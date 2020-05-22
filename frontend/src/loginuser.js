import React, { Component } from "react";
import LoginForUser from "./components/loginForUser.js";

import "./styles/LoginUser.css";
import "./styles/LoginAdmin.css";
import { ReactComponent as Logo } from "./img/doctor-svgrepo-com.svg";

class LoginUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      placeID: props.match.params.placeID,
    };
  }
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
          <LoginForUser
            praxisID={this.state.placeID}
            isPraxis={!("" === this.state.placeID)}
          />
        </div>
        <div className="container-bottom">
          {" "}
          <a href="http://localhost:3000/admin">Admin</a>{" "}
          <a href="https://www.google.de">About</a>
          <a href="https://www.google.de">AGB</a>
        </div>
      </div>
    );
  }
}

export default LoginUser;
