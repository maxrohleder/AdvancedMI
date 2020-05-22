import React, { Component } from "react";
import LoginForUser from "./components/loginForUser.js";

class LoginUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      placeID: props.match.params.placeID,
    };
  }
  render() {
    return (
      <React.Fragment>
        <p>hey user</p>
        Your PlaceID is: {this.state.placeID}
        <br />
        <LoginForUser
          praxisID={this.state.placeID}
          isPraxis={!("" === this.state.placeID)}
        />
        <br />
      </React.Fragment>
    );
  }
}

export default LoginUser;
