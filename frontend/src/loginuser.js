import React, { Component } from "react";
import { Link } from "react-router-dom";
import LoginForUser from "./components/loginForUser.js";
import { API_URL } from "./constants/all";

class LoginUser extends Component {
  constructor(props) {
    super(props);
    console.log(props.match.params.placeID);
    this.state = {
      placeID: props.match.params.placeID,

      name: null,
      address: null,
      field: null,
    };
  }
  componentDidMount() {
    console.log(this.props);
    var apicall = API_URL + "details/" + this.state.placeID;
    console.log(apicall);
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

  isGoodBye = () => {
    console.log(this.props);
    if (this.props.location.state) {
      return (
        <div className="login-greeting">
          Vielen Dank für Ihren Besuch
          <br />
          Wir hoffen wir sehen sie nie wieder :D
        </div>
      );
    }
  };

  render() {
    return (
      <div className="login-img">
        <div className="login-main">
          <div className="login-header">
            Digitaler <span>Warteraum</span>
          </div>

          <div className="login-greeting">
            <span>{this.state.name}</span> <br />
            {this.state.field} <br />
            {this.state.address} <br />
          </div>

          {this.isGoodBye()}
          <div className="login-form">
            <LoginForUser
              praxisID={this.state.placeID}
              isPraxis={!("" === this.state.placeID)}
            />
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

export default LoginUser;
