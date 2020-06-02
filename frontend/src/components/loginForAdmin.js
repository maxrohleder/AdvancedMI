import React, { Component } from "react";
import { Redirect } from "react-router-dom";
//import Jumbotron from "../react-bootstrap/Jumbotron";
import "../styles/LoginAdmin.css";

const APIendpoint = "http://localhost:8000/";
class LoginForAdmin extends Component {
  constructor(props) {
    super(props);
    this.state = { praxisID: null, password: null, redirect: null };
  }

  handleChange = (event) => {
    var target = event.target;
    console.log(target.id);
    if (target.id === "praxis") {
      this.setState({ praxisID: event.target.value });
      console.log("updated : " + target.id + " : " + event.target.value);
    } else {
      this.setState({ password: event.target.value });
      console.log("updated : " + target.id + " : " + event.target.value);
    }
  };

  handleSubmit = (event) => {
    //alert("A name was submitted: " + this.state.value);
    console.log("Praxis:ID : " + this.state.praxisID);
    console.log("PASWORD: " + this.state.password);
    var praxisID = this.state.praxisID;
    var password = this.state.password;
    var newPageUrl = "/admin/" + praxisID;

    if (praxisID == null) {
      alert("Enter a PraxisID");
      event.preventDefault();
    } else {
      if (password == null) {
        alert("Enter a Password");
        event.preventDefault();
      } else {
        console.log("fetching admin info");
        fetch(APIendpoint + "exists/admin/" + praxisID + "/" + password)
          .then((response) => response.json())
          .then((data) => {
            if (data.praxisConfirmed) {
              console.log(this.props.onAdminLoggedIn);
              this.props.onAdminLoggedIn(true);
              this.setState({ redirect: newPageUrl });
            } else {
              alert("praxis oder password falsch, please try again");
            }
          })
          .catch(() => {
            console.log();
            this.setState({ redirect: "/error" });
          });

        event.preventDefault();
      }
    }
  };

  render() {
    if (this.state.redirect) {
      console.log("redirecting to: " + this.state.redirect);
      return <Redirect to={this.state.redirect} />;
    }
    return (
      <div className={"form-admin"}>
        <form onSubmit={this.handleSubmit}>
          <label>
            Praxis: <br />
            <input
              type="text"
              name="praxis"
              id="praxis"
              onChange={this.handleChange}
            />
          </label>
          <br />
          <label>
            Passwort:
            <br />
            <input
              type="password"
              name="password"
              id="password"
              onChange={this.handleChange}
            />
          </label>
          <br />
          <div className="container-button">
            <input type="submit" value="Betreten" />
          </div>
        </form>
      </div>
    );
  }
}

export default LoginForAdmin;
