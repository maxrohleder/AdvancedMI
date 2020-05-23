import React, { Component } from "react";
import LoginForUser from "./components/loginForUser.js";

import "./styles/LoginUser.css";
import "./styles/LoginAdmin.css";
import { ReactComponent as Logo } from "./img/doctor-svgrepo-com.svg";

const APIendpoint = "http://127.0.0.1";
const port = 8000;

class LoginUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      placeID: props.match.params.placeID,

      name: null,
      address: null,
      field: null,
    };
  }
  componentDidMount() {
    var apicall = APIendpoint + ":" + port + "/" + this.state.placeID;
    fetch(apicall)
      .then((response) => response.json())
      .then((data) => {
        this.setState({
          name: data.name,
          address: data.address,
          field: data.field,
        });
      })
      .catch(console.log);
  }

  render() {
    return (
      <div className="app1">
        <div className="header">
          <div>
            Digitaler <span>Warteraum</span>
          </div>
          <div>
            <a href="http://localhost:3000">Home</a>
          </div>
        </div>

        <div className="place-info">
          <div>
            <h1>{this.state.name}</h1>
            {this.state.field}
            <br />
            {this.state.address}
          </div>
          <Logo id="img" />
        </div>

        <div className="card">
          <LoginForUser
            praxisID={this.state.placeID}
            isPraxis={!("" === this.state.placeID)}
          />
        </div>
      </div>
    );
  }
}

export default LoginUser;
