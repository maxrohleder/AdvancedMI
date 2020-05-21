import React, { Component } from "react";
//import Jumbotron from "../react-bootstrap/Jumbotron";

class LoginForUser extends Component {
  constructor(props) {
    super(props);
    this.state = { praxisID: null, userID: null, isPraxis: false };
  }

  handleChange = (event) => {
    var target = event.target;
    console.log(target.id);
    if (target.id == "praxis") {
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
      if (this.state.isPraxis && userID == "") {
        alert("Gultige User ID eingeben ...: " + userID);
        //return;
      }
      if (this.state.isPraxis && userID != "") {
        alert(
          "CHK if  User ID is valid for praxisID  ...: " +
            userID +
            " --> " +
            praxisID
        );
        window.open(newPageUrl, "_blank");
      } else if (!this.state.isPraxis) {
        window.open(newPageUrl, "_blank");
      }
    }
    event.preventDefault();
  };

  isPraxis = () => {
    if (this.props.praxisID != undefined) {
      this.state.praxisID = this.props.praxisID;
      this.state.isPraxis = true;
      return (
        <div>
          <button onClick={() => this.clickBackButton()}>Back to Login</button>
          <p>Wilkommen in Praxis : {this.props.praxisID}</p>
        </div>
      );
    } else {
      return (
        <div>
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
        </div>
      );
    }
  };
  clickAdminButton = () => {
    window.open("http://localhost:3000/admin", "_blank");
  };
  clickBackButton = () => {
    window.open("http://localhost:3000", "_blank");
  };
  render() {
    return (
      <React.Fragment>
        <img src={"https://picsum.photos/200"} alt="" />
        <br />

        <button onClick={() => this.clickAdminButton()}>Admin</button>

        {this.isPraxis()}
        <form onSubmit={this.handleSubmit}>
          <label>
            UserID:
            <input
              type="text"
              name="user"
              id="user"
              value2={this.state.userID}
              onChange={this.handleChange}
            />
          </label>
          <br />
          <input type="submit" value="Submit" />
        </form>
      </React.Fragment>
    );
  }
}

export default LoginForUser;
