import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { Link } from "react-router-dom";
import EditAdminInfo from "./editAdminInfo.js";
import { API_URL, VERIFY_EMAIL_ROUTE } from "../constants/all";

class RegisterAdmin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: null,
      password: null,

      editPage: false,
      redirect: null,
    };
  }

  handleChangeToLogin = () => {
    this.setState({ redirect: "/admin" });
  };

  handleChange = (event) => {
    var target = event.target;
    // save fields in component state
    if (target.id === "email") {
      this.setState({ email: event.target.value });
    } else if (target.id === "password") {
      this.setState({ password: event.target.value });
    }
  };

  handleSubmit = (event) => {
    if (this.state.email == null || this.state.password == null) {
      alert("Bitte jedes Feld ausfüllen");
      event.preventDefault();
    } else {
      var payload = JSON.stringify({
        email: this.state.email,
      });
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
      };
      console.log("fetch: " + API_URL + VERIFY_EMAIL_ROUTE);
      console.log(payload);

      fetch(API_URL + VERIFY_EMAIL_ROUTE, requestOptions)
        .then((response) => response.json())
        .then((data) => {
          if (data.isNewMail) {
            //email und password are not yet existant
            this.setState({ editPage: true });
          } else {
            alert("Enter Valid Email/ Email already taken ");
          }
        })
        .catch(() => {
          console.log();
          this.setState({ redirect: "/error" });
        });

      event.preventDefault();
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
      // no token. must be a new user
      return null;
    } else {
      // known cookie. redirect to admin view
      return token.split("praxisID=")[1];
    }
  };

  componentDidMount() {
    var cook = this.getAdminCookie();
    if (cook != null) {
      // if a cookie is set; redirect to the encoded admin page
      this.setState({
        redirect: cook,
      });
    }
  }

  pageSelector = () => {
    if (this.state.editPage == false) {
      return this.renderFirstPage();
    } else {
      return this.renderEditPage();
    }
  };

  changeRedirect = (e) => {
    this.setState({ redirect: e });
  };

  renderFirstPage = () => {
    // this page is shown initially to create a new user with email and pwd
    return (
      <div className="login-img">
        <div className="login-main">
          <div className="login-header">
            Digitaler Warteraum <br />
            <span>Registrierung</span>
          </div>

          <div className="login-form">
            <div className="form-user">
              <form onSubmit={this.handleSubmit}>
                <label>
                  E-Mail:
                  <input
                    type="text"
                    name="email"
                    id="email"
                    onChange={this.handleChange}
                  />
                </label>
                <label>
                  Password:
                  <input
                    type="text"
                    name="password"
                    id="password"
                    onChange={this.handleChange}
                  />
                </label>
                <br />
                <div className="register-button">
                  <input type="submit" value="neu Anmelden" />
                </div>
                <br />
                <div className="register-button">
                  <input
                    onClick={this.handleChangeToLogin}
                    defaultValue="Already have an Account?"
                  />
                </div>
              </form>
            </div>
          </div>
          <div className="login-footer">
            <Link to="/">Home</Link>
            <Link to="/impressum">Impressum</Link>
            <Link to="/agb">AGB</Link>
          </div>
        </div>
      </div>
    );
  };

  renderEditPage = () => {
    return (
      <div className="login-img">
        <div className="login-main">
          <div className="login-header">
            Praxis <span>Daten</span> Editor
          </div>

          <div className="login-form">
            <div className="form-user">
              <EditAdminInfo
                email={this.state.email}
                password={this.state.password}
                onRedirect={this.changeRedirect}
              />
            </div>
          </div>

          <div className="login-footer">
            <Link to="/admin">Admin</Link>
            <Link to="/">Home</Link>
            <Link to="/impressum">Impressum</Link>
            <Link to="/agb">AGB</Link>
          </div>
        </div>
      </div>
    );
  };

  render() {
    if (this.state.redirect) {
      console.log("redirecting to: " + this.state.redirect);
      return <Redirect to={this.state.redirect} />;
    }

    return <div>{this.pageSelector()}</div>;
  }
}

export default RegisterAdmin;
