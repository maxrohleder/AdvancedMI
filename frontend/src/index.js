import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import './index.css';
import * as serviceWorker from './serviceWorker';
import AdminApp from './AdminApp'
import PatientApp from './PatientApp'

ReactDOM.render(
  <Router>
    <Switch>
      <Route path="/admin/:placeId" component={ AdminApp } />
      <Route path="/" component={ PatientApp } />
    </Switch>
  </Router>, document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
