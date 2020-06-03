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
import LoginUser from "./LoginUser";
import LoginAdmin from "./LoginAdmin";
import chatWindow from "./components/chatWindow";

import "./index.css";

//loggin for admin only if password was correct
var adminLoggedIn = false;
function setAdminLoggedIn(entry) {
  adminLoggedIn = entry;
}
const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={(props) =>
      adminLoggedIn === true ? (
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
        component={() => <LoginAdmin onAdminLoggedIn={setAdminLoggedIn} />}
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
