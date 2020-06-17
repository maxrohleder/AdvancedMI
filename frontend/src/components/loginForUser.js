import React, { Component } from "react";
import { Redirect } from "react-router-dom";

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
    var userID = this.state.userID == null ? "null" : this.state.userID;

    console.log("praxisID: " + praxisID);
    console.log("userID: " + userID);

    if (praxisID == null) {
      alert("Gultige PraxisID eingeben ...: " + praxisID);
    } else {
      var newPageUrl = "/ort/" + praxisID;
      if (userID != "null") {
        newPageUrl += "/id/" + userID;
      }
      console.log("newPageUrl: " + newPageUrl);
      console.log("fetching user info");

      fetch(APIendpoint + "exists/user/" + praxisID + "/" + userID)
        .then((response) => response.json())
        .then((data) => {
          if (data.praxisConfirmed) {
            if (data.userConfirmed) {
              console.log("praxis confirmed and userId confirmed");
              this.setState({ redirect: newPageUrl });
            } else {
              if (userID == "null") {
                if (this.state.isPraxis && userID == "null") {
                  alert("Bitte UserId eingeben");
                } else {
                  console.log(
                    "praxis confirmed and userId null -> /ort/praxis"
                  );
                  this.setState({ redirect: newPageUrl });
                }
              } else {
                console.log("praxis confirmed and userId NOT confirmed");
                alert("UserID " + userID + " ist ungültig. Bitte überprüfen.");
              }
            }
          } else {
            alert("PraxisID " + praxisID + " ist ungültig. Bitte überprüfen.");
          }
        })
        .catch(() => {
          console.log();
          this.setState({ redirect: "/error" });
        });
    }
    event.preventDefault();
  };

  isPraxis = () => {
    if (!(this.props.isPraxis === true)) {
      return (
        <React.Fragment>
          <label>
            Praxis ID:
            <input
              type="text"
              name="praxis"
              id="praxis"
              onChange={this.handleChange}
            />
          </label>
          <br />
        </React.Fragment>
      );
    }
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
            User ID:
            <input
              type="text"
              name="user"
              id="user"
              onChange={this.handleChange}
            />
          </label>
          <br />
          <div className="container-button">
            <input type="submit" value="⮕" />
          </div>
        </form>
      </div>
    );
  }
}

export default LoginForUser;
