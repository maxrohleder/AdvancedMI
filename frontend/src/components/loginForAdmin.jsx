import React, { Component } from "react";
//import Jumbotron from "../react-bootstrap/Jumbotron";

class LoginForAdmin extends Component {
  constructor(props) {
    super(props);
    this.state = { praxisID: null, password: null };
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
    var newPageUrl = "http://localhost:3000/admin/" + praxisID;
    if (praxisID != null && password != null) {
      alert("CHK if PW is correct ...: " + password);
      window.open(newPageUrl, "_blank");
      event.preventDefault();
    } else if (praxisID == null) {
      alert("Gueltige Praxis ID eingeben ...: " + praxisID);
      event.preventDefault();
    } else {
      alert("Gueltiges Passwort eingeben ...: " + password);
      event.preventDefault();
    }
  };

  render() {
    return (
      <React.Fragment>
        <img src={"https://picsum.photos/200"} alt="" />
        <form onSubmit={this.handleSubmit}>
          {" "}
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
          <label>
            Passwort:
            <input
              type="text"
              name="password"
              id="password"
              value2={this.state.password}
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

export default LoginForAdmin;
