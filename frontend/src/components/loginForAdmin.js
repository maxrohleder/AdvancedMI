import React, { Component } from "react";
import { Redirect } from "react-router-dom";
//import Jumbotron from "../react-bootstrap/Jumbotron";

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
        //get token
        var payload = JSON.stringify({
          praxisID: praxisID,
          password: password,
        });
        const requestOptions = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
        };
        var url = APIendpoint + "auth/admin/";
        console.log("fetching admin info from " + url);
        console.log(praxisID);

        fetch(url, requestOptions)
          .then((response) => response.json())
          .then((data) => {
            if (data.praxisConfirmed) {
              document.cookie =
                "Access-Token=" +
                data.accessToken +
                "praxisID=" +
                praxisID +
                "; max-age = " +
                60 * 60 * 24 * 31; //einMonat langer cookie
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
  getAdminCookie = () => {
    function escape(s) {
      return s.replace(/([.*+?\^${}()|\[\]\/\\])/g, "\\$1");
    }
    var match = document.cookie.match(
      RegExp("(?:^|;\\s*)" + escape("Access-Token") + "=([^;]*)")
    );
    var token = match ? match[1] : null;
    if (token == null) {
      console.log("KEIN TOKEN");
      return null;
    } else {
      console.log("TOKEN VORHANDEN");
      return token.split("praxisID=")[1];
    }
  };

  pageSelecter = () => {
    if (this.getAdminCookie() != null) {
      this.setState({
        redirect: "admin/" + this.getAdminCookie(),
      });
    }
  };
  render() {
    this.pageSelecter();
    if (this.state.redirect) {
      console.log("redirecting to: " + this.state.redirect);
      return <Redirect to={this.state.redirect} />;
    }
    return (
      <div className="form-user">
        <form onSubmit={this.handleSubmit}>
          <label>
            Praxis ID: <br />
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
          <div className="login-button-container">
            <input type="submit" value="⮕" />
          </div>
        </form>
      </div>
    );
  }
}

export default LoginForAdmin;
