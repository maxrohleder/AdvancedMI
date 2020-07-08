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

import "./index.css";

//loggin for admin only if password was correct//outdated
var adminLogToken = 123; //null
function setAdminToken(entry) {
  adminLogToken = entry;
}

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
  //console.log(TokenValue);
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
      <PrivateRoute path="/admin/:placeID" component={AdminApp} />
      <Route
        path="/admin"
        component={() => <LoginAdmin onAdminToken={setAdminToken} />}
      />
      <Route path="/ort/:placeID/id/:patientID/chat" component={chatWindow} />
      <Route path="/ort/:placeID/id/:patientID" component={PatientApp} />
      <Route path="/ort/:placeID" component={LoginUser} />
      <Route path="/error" component={Error} />
      <Route exact path="/" component={Login} />
    </Switch>
  </Router>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
