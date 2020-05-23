import React, { Component } from "react";
import { Redirect, Link } from "react-router-dom";
//import Jumbotron from "../react-bootstrap/Jumbotron";
import "../styles/LoginUser.css";

const APIendpoint = "http://localhost:8000/";

class LoginForUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      praxisID: props.praxisID,
      userID: null,
      isPraxis: props.isPraxis,
      redirect: null,

      name: null,
      address: null,
      field: null,
    };
  }

  handleChange = (event) => {
    var target = event.target;
    console.log(target.id);
    if (target.id === "praxis") {
      this.setState({ praxisID: event.target.value });
      // console.log("updated : " + target.id + " : " + event.target.value);
    } else {
      this.setState({ userID: event.target.value });
      // console.log("updated : " + target.id + " : " + event.target.value);
    }
  };

  handleSubmit = (event) => {
    //alert("A name was submitted: " + this.state.value);
    // console.log("Praxis:ID : " + this.state.praxisID);
    // console.log("User:ID: " + this.state.userID);
    var praxisID = this.state.praxisID;
    var userID = this.state.userID == null ? "" : this.state.userID;
    var newPageUrl = "/ort/" + praxisID + "/id/" + userID;

    if (praxisID == null) {
      alert("Gultige PraxisID eingeben ...: " + praxisID);
    }
    console.log("fetching user info");
    fetch(APIendpoint + "exists/" + praxisID + "/" + userID)
      .then((response) => response.json())
      .then((data) => {
        if (data.userConfirmed) {
          this.setState({ redirect: newPageUrl });
        } else {
          alert("UserID " + userID + " ist ungültig. Bitte überprüfen.");
        }
      })
      .catch(() => {
        console.log();
        this.setState({ redirect: "/error" });
      });
    event.preventDefault();
  };

  isPraxis = () => {
    if (this.props.isPraxis === true) {
      return (
        <div className="isPraxis">
          <span>
            Wilkommen
            <br />
          </span>
          Bitte geben sie ihre <span>UserID</span> ein
        </div>
      );
    } else {
      return (
        <React.Fragment>
          <label>
            Praxis:
            <input
              type="text"
              name="praxis"
              id="praxis"
              value1={this.state.praxisID}
              onChange={this.handleChange}
            />
          </label>
          <br />
        </React.Fragment>
      );
    }
  };

  isPraxis_hide = () => {
    var x = "";
    x = this.props.isPraxis === true ? "" : "UserID";
    return x;
  };

  render() {
    if (this.state.redirect) {
      console.log("redirecting to: " + this.state.redirect);
      return <Redirect to={this.state.redirect} />;
    }

    return (
      <div className="form-user">
        <form onSubmit={this.handleSubmit}>
          {this.isPraxis()}
          <label>
            {this.isPraxis_hide()}
            <input
              type="text"
              name="user"
              id="user"
              value2={this.state.userID}
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

export default LoginForUser;
