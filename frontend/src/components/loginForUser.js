import React, { Component } from "react";
//import Jumbotron from "../react-bootstrap/Jumbotron";
import "../styles/LoginUser.css";

class LoginForUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      praxisID: props.praxisID,
      userID: null,
      isPraxis: props.isPraxis,

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
      console.log("updated : " + target.id + " : " + event.target.value);
    } else {
      this.setState({ userID: event.target.value });
      console.log("updated : " + target.id + " : " + event.target.value);
    }
  };

  handleSubmit = (event) => {
    //alert("A name was submitted: " + this.state.value);
    console.log("Praxis:ID : " + this.state.praxisID);
    console.log("User:ID: " + this.state.userID);
    var praxisID = this.state.praxisID;
    var userID = this.state.userID == null ? "" : this.state.userID;
    var newPageUrl = "http://localhost:3000/" + praxisID + "/" + userID;
    if (praxisID == null) {
      alert("Gultige PraxisID eingeben ...: " + praxisID);
    } else {
      if (this.state.isPraxis && userID === "") {
        alert("Gultige User ID eingeben ...: " + userID);
        //return;
      }
      if (this.state.isPraxis && userID !== "") {
        alert(
          "CHK if  User ID is valid for praxisID  ...: " +
            userID +
            " --> " +
            praxisID
        );
        window.open(newPageUrl, "_self");
      } else if (!this.state.isPraxis) {
        window.open(newPageUrl, "_self");
      }
    }
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
