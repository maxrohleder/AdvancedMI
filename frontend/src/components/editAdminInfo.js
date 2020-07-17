import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { Link } from "react-router-dom";

const APIendpoint = "http://localhost:8000/";

class EditAdminInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: props.email,
      password: props.password,

      praxisName: null,
      userName: "",
      zipCode: null,
      place: null,
      street: null,
      houseNumber: null,
      phoneNumber: null,

      agbChecked: false,
    };
  }

  handleChange = (event) => {
    var target = event.target;
    //console.log(target.id);
    if (target.id === "praxisName") {
      this.setState({ praxisName: event.target.value });
      var userNameVorschlag = event.target.value.split(" ");
      if (userNameVorschlag[1] == undefined) {
        userNameVorschlag = userNameVorschlag[0].substring(0, 2);
      } else {
        userNameVorschlag =
          userNameVorschlag[0].substring(0, 2) + userNameVorschlag[1];
      }
      this.setState({ userName: userNameVorschlag });
      //console.log("updated : " + target.id + " : " + event.target.value);
    } else if (target.id === "userName") {
      this.setState({ userName: event.target.value });
      //console.log("updated : " + target.id + " : " + event.target.value);
    } else if (target.id === "zipCode") {
      this.setState({ zipCode: event.target.value });
      //console.log("updated : " + target.id + " : " + event.target.value);
    } else if (target.id === "place") {
      this.setState({ place: event.target.value });
      //console.log("updated : " + target.id + " : " + event.target.value);
    } else if (target.id === "street") {
      this.setState({ street: event.target.value });
      //console.log("updated : " + target.id + " : " + event.target.value);
    } else if (target.id === "houseNumber") {
      this.setState({ houseNumber: event.target.value });
      //console.log("updated : " + target.id + " : " + event.target.value);
    } else if (target.id === "phoneNumber") {
      this.setState({ phoneNumber: event.target.value });
      //console.log("updated : " + target.id + " : " + event.target.value);
    } else if (target.id === "email") {
      this.setState({ email: event.target.value });
      //console.log("updated : " + target.id + " : " + event.target.value);
    } else if (target.id === "AGB") {
      this.setState({ agbChecked: event.target.checked });
      console.log("updated : " + target.id + " : " + event.target.checked);
    }
  };

  handleSubmit = (event) => {
    if (
      this.state.praxisName == null ||
      this.state.userName == null ||
      this.state.zipCode == null ||
      this.state.place == null ||
      this.state.street == null ||
      this.state.houseNumber == null ||
      this.state.phoneNumber == null ||
      this.state.email == null
    ) {
      alert("Bitte jedes Feld ausfüllen");
      event.preventDefault();
    } else if (this.state.agbChecked) {
      var payload = JSON.stringify({
        praxisName: this.state.praxisName,
        userName: this.state.userName,
        zipCode: this.state.zipCode,
        street: this.state.street,
        houseNumber: this.state.houseNumber,
        phoneNumber: this.state.phoneNumber,
        email: this.state.email,
      });
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
      };
      console.log(payload);
      console.log("Bitte JWT vom Backend");

      this.props.onRedirect("/admin/" + this.state.userName); //<--this is test

      fetch(APIendpoint + "register/user/", requestOptions)
        .then((response) => response.json())
        .then((data) => {
          if (data.Confirmed) {
            document.cookie =
              "Access-Token=" +
              data.accessToken +
              "praxisID=" +
              this.state.userName +
              "; max-age = " +
              60 * 60 * 24 * 31; //einMonat langer cookie
            this.props.onChange("/admin/" + this.state.userName);
          }
        })
        .catch(() => {
          //this.setState({ redirect: "/error" });
        });

      event.preventDefault();
    } else {
      alert("Bitte AGB akzeptieren");
      event.preventDefault();
    }
  };

  render() {
    return (
      <div>
        UserName: {this.state.userName} <br /> E-Mail: {this.state.email}
        <div className="form-user">
          <form onSubmit={this.handleSubmit}>
            <label>
              Praxis Name
              <input
                type="text"
                name="praxisName"
                id="praxisName"
                onChange={this.handleChange}
              />
            </label>
            <label>
              Praxis UserName
              <input
                type="text"
                name="userName"
                id="userName"
                value={this.state.userName}
                onChange={this.handleChange}
              />
            </label>
            <label>
              Adresse - Postleitzahl:
              <input
                type="number"
                name="zipCode"
                id="zipCode"
                onChange={this.handleChange}
              />
            </label>
            <label>
              Adresse - Ort:
              <input
                type="text"
                name="place"
                id="place"
                onChange={this.handleChange}
              />
            </label>
            <label>
              Adresse - Strasse:
              <input
                type="text"
                name="street"
                id="street"
                onChange={this.handleChange}
              />
            </label>
            <label>
              Adresse - Hausnummer:
              <input
                type="number"
                name="houseNumber"
                id="houseNumber"
                onChange={this.handleChange}
              />
            </label>
            <label>
              Telefonnummer
              <input
                type="text"
                name="phoneNumber"
                id="phoneNumber"
                onChange={this.handleChange}
              />
            </label>
            <label>
              New Email:
              <input
                type="text"
                name="email"
                id="email"
                onChange={this.handleChange}
              />
            </label>
            <label>
              <Link to="/impressum">Accept AGB ? </Link>
              <input
                type="checkbox"
                id="AGB"
                name="AGB"
                onChange={this.handleChange}
              />
            </label>
            <br />
            <div>
              <input type="submit" value="⮕Change" />
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default EditAdminInfo;