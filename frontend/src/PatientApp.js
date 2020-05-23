import React from "react";
import "./styles/PatientApp.css";
import { Redirect } from "react-router-dom";

import openSocket from "socket.io-client";
import { ReactComponent as Logo } from "./img/doctor-svgrepo-com.svg";

const APIendpoint = "http://127.0.0.1";
const port = 8000;

const socket = openSocket(APIendpoint + ":" + port);

function setCalledCb(cb) {
  socket.on("called", (patId) => {
    cb(null, patId);
  });
}

function setUpdateCb(cb) {
  socket.on("update", (data) => {
    cb(null, data.list);
  });
}

function setTimingCb(cb) {
  socket.on("timing", (dt) => {
    cb(null, dt);
  });
}

class PatientApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      placeID: props.match.params.placeID,
      patientID: props.match.params.waitingID,

      name: null,
      address: null,
      field: null,

      waitingPosition: null, // calculated on update
      minPerPerson: null, // used to calculate time estimate
      isCalled: null,
      redirect: null, // set by update callback when patientID is not found
    };

    // subscribe to called
    setCalledCb((err, num) => {
      var c = num === this.state.patientID;
      this.setState({ isCalled: c });
    });

    // subscribe to update
    setUpdateCb((err, lst) => {
      var entry = lst.find((x) => x.id == this.state.patientID);
      if (typeof entry === "undefined") {
        // the patientID is not registered (anymore)
        this.setState({ redirect: "/" + this.state.placeID });
      } else {
        this.setState({ waitingPosition: entry.pos });
      }
    });

    // subscribe to timing
    setTimingCb((err, dt) => this.setState({ minPerPerson: dt }));
  }

  componentDidMount() {
    var apicall = APIendpoint + ":" + port + "/" + this.state.placeID;
    fetch(apicall)
      .then((response) => response.json())
      .then((data) => {
        this.setState({
          name: data.name,
          address: data.address,
          field: data.field,
        });
      })
      .catch(console.log);
  }

  render() {
    // Redirect to login screen if the patientID was not found
    if (this.state.redirect) {
      return <Redirect to={this.state.redirect} />;
    }

    let status;
    if (this.state.isCalled) {
      status = <div>Bitte in die Praxis kommen.</div>;
    } else {
      var timeEstimate = this.state.waitingPosition * this.state.minPerPerson;
      status = (
        <div>
          Ihre ungefähre Wartezeit beträgt <br />
          <span>{timeEstimate} Minuten.</span>
        </div>
      );
    }

    return (
      <div className="app">
        <div className="header">
          <div>
            Digitaler <span>Warteraum</span>
          </div>
          <div>
            <a href="/">Home</a>
          </div>
        </div>

        <div className="place-info">
          <div>
            <h1>{this.state.name}</h1>
            {this.state.field}
            <br />
            {this.state.address}
          </div>
          <Logo id="img" />
        </div>

        <div className="card">
          Patienten vor Ihnen:
          <div className="circle">{this.state.waitingPosition}</div>
          {status}
        </div>
      </div>
    );
  }
}

// export a single class
export default PatientApp;
