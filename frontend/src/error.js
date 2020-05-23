import React, { Component } from "react";
import { Link } from "react-router-dom";
import "./styles/PatientApp.css";

class Error extends Component {
  render() {
    return (
      <div className="app">
        <div className="header">
          <div>
            Digitaler <span>Warteraum</span>
          </div>
          <div>
            <Link to="/">Home</Link>
          </div>
        </div>

        <div className="card">
          <p>Oops!</p>
          <p>Ein interner Fehler ist aufgetreten.</p>
          <Link to="/">Zur Startseite</Link>
        </div>
      </div>
    );
  }
}

export default Error;
