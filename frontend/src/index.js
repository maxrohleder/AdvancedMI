//import "bootstrap/dist/css/bootstrap.css";

import React from "react";
import ReactDOM from "react-dom";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import * as serviceWorker from "./serviceWorker";

import AdminApp from "./AdminApp";
import PatientApp from "./PatientApp";
import Error from "./error";

import Login from "./login";
import LoginUser from "./loginuser";
import LoginAdmin from "./loginadmin";
import chatWindow from "./components/chatWindow";

import RegisterAdmin from "./components/registerAdmin";

import "./index.css";

function getAdminCookie() {
  //to change//implement react-cookie structure
  function escape(s) {
    return s.replace(/([.*+?\^${}()|\[\]\/\\])/g, "\\$1");
  }
  var match = document.cookie.match(
    RegExp("(?:^|;\\s*)" + escape("Access-Token") + "=([^;]*)")
  );
  return match ? match[1] : null;
}
function checkAdminToken() {
  var TokenValue = getAdminCookie();
  if (TokenValue == null) {
    console.log("Kein Token umgeleitet auf index");
  }
  return TokenValue != null;
}

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={(props) =>
      checkAdminToken() ? (
        <Component {...props} />
      ) : (
        <Redirect
          to={{
            pathname: "/",
          }}
        />
      )
    }
  />
);

ReactDOM.render(
  <Router>
    <Switch>
      <Route path="/admin/registerAdmin" component={RegisterAdmin} />
      <PrivateRoute path="/admin/:placeID" component={AdminApp} />
      <Route path="/admin" component={LoginAdmin} />
      <Route path="/place/:placeID/id/:patientID/chat" component={chatWindow} />
      <Route path="/place/:placeID/id/:patientID" component={PatientApp} />
      <Route path="/place/:placeID" component={LoginUser} />
      <Route path="/error" component={Error} />
      <Route exact path="/" component={Login} />
    </Switch>
  </Router>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
