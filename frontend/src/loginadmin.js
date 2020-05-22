import React, { Component } from "react";
import LoginForAdmin from "./components/loginForAdmin.js";

class LoginAdmin extends Component {
  state = {};
  render() {
    return (
      <React.Fragment>
        <p>LOGIN ADMIN</p>
        <br />
        <LoginForAdmin />
      </React.Fragment>
    );
  }
}

export default LoginAdmin;
