import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { Link } from "react-router-dom";
import EditAdminInfo from "./editAdminInfo.js";

const APIendpoint = "http://localhost:8000/";

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

  handleClick = () => {
    this.setState({ redirect: "/admin" });
  };

  handleChange = (event) => {
    var target = event.target;
    //console.log(target.id);
    if (target.id === "email") {
      this.setState({ email: event.target.value });
      //console.log("updated : " + target.id + " : " + event.target.value);
    } else if (target.id === "password") {
      this.setState({ password: event.target.value });
      //console.log("updated : " + target.id + " : " + event.target.value);
    }
  };

  handleSubmit = (event) => {
    if (this.state.email == null || this.state.password == null) {
      alert("Bitte jedes Feld ausfüllen");
      event.preventDefault();
    } else {
      //this is test
      if (true) {
        this.setState({ editPage: true });
      } //this is test

      var payload = JSON.stringify({
        userName: this.state.userName,
        email: this.state.email,
        password: this.state.password,
      });
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
      };
      console.log("fetch: " + APIendpoint + "register/user/");
      console.log(payload);
      /*
      fetch(APIendpoint + "exists/user/", requestOptions)
        .then((response) => response.json())
        .then((data) => {
          var dataConfirmed = data.EmailConfirmed;
          if (data.EmailConfirmed) {
            //email und password gehen klar
            this.setState({ editPage: true });
          } else {
            alert("Enter Valid Email/ Email allready taken ");
          }
        })
        .catch(() => {
          console.log();
          this.setState({ redirect: "/error" });
        });*/

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
      //console.log("KEIN TOKEN");
      return null;
    } else {
      //console.log("TOKEN VORHANDEN");
      return token.split("praxisID=")[1];
    }
  };

  componentDidMount() {
    if (this.getAdminCookie() != null) {
      //console.log(APIendpoint + "admin/" + this.getAdminCookie());
      this.setState({
        redirect: this.getAdminCookie(),
      });
    }
  }

  pageSelecter = () => {
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
                  <input type="submit" value="⮕ Registrieren" />
                </div>
                <br />
                <div className="register-button">
                  <input
                    onClick={this.handleClick}
                    defaultValue="⮕ Allready have an Account?"
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
                password={this.state.userName}
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

    return <div>{this.pageSelecter()}</div>;
  }
}

export default RegisterAdmin;
