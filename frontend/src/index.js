//import "bootstrap/dist/css/bootstrap.css";

import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import "./index.css";
import * as serviceWorker from "./serviceWorker";
import AdminApp from "./AdminApp";
import PatientApp from "./PatientApp";

import Login from "./login";
import LoginUser from "./loginuser";
import LoginAdmin from "./loginadmin";

ReactDOM.render(
  <Router>
    <Switch>
      <Route path="/admin/:placeID" component={AdminApp} />
      <Route path="/admin" component={LoginAdmin} />
      <Route path="/:placeID/:waitingID" component={PatientApp} />
      <Route path="/:placeID" component={LoginUser} />
      <Route path="/" component={Login} />
    </Switch>
  </Router>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
