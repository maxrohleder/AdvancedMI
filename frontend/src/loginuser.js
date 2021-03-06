import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
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

      redirect: null,
    };
  }
  componentDidMount() {
    var apicall = API_URL + "details/" + this.state.placeID;
    console.log(apicall);
    fetch(apicall)
      .then((response) => response.json())
      .then((data) => {
        if (!data.exists) {
          this.setState({ redirect: "/" });
        }
        this.setState({
          name: data.name,
          address: data.address,
          field: data.field,
        });
      })
      .catch(console.log);
  }

  isGoodBye = () => {
    if (this.props.location.state) {
      return (
        <div className="login-greeting">Vielen Dank für Ihren Besuch!</div>
      );
    }
  };

  render() {
    if (this.state.redirect) {
      return <Redirect to={this.state.redirect} />;
    }
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
