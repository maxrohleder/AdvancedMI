//import "bootstrap/dist/css/bootstrap.css";

import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import * as serviceWorker from "./serviceWorker";

import AdminApp from "./AdminApp";
import PatientApp from "./PatientApp";
import Error from "./error";

import Login from "./login";
import LoginUser from "./LoginUser";
import LoginAdmin from "./LoginAdmin";

import "./index.css";

ReactDOM.render(
  <Router>
    <Switch>
      <Route path="/admin/:placeID" component={AdminApp} />
      <Route path="/admin" component={LoginAdmin} />
      <Route path="/ort/:placeID/id/:patientID" component={PatientApp} />
      <Route path="/ort/:placeID" component={LoginUser} />
      <Route exact path="/" component={Login} />
      <Route path="/error" component={Error} />
    </Switch>
  </Router>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
