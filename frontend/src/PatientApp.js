import React from "react";
import "./styles/PatientApp.css";
import { Redirect, Link } from "react-router-dom";

import io from "socket.io-client";
import { ReactComponent as Logo } from "./img/doctor-svgrepo-com.svg";

const APIendpoint = "http://127.0.0.1";
const port = 8000;
const socket = io.connect(APIendpoint + ":" + port, { autoConnect: false });
// const socket = io({
//   autoConnect: false,
// });

function setCalledCb(cb) {
  socket.on("called", (patId) => {
    cb(null, patId);
  });
}

function setUpdateCb(cb) {
  socket.on("update", (data) => {
    cb(null, data.ukerlangen);
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
      patientID: props.match.params.patientID,

      name: null,
      address: null,
      field: null,

      waitingPosition: null, // calculated on update
      minPerPerson: null, // used to calculate time estimate
      isCalled: null,
      redirect: null, // set by update callback when patientID is not found
    };
  }

  componentDidMount() {
    // connect to real-time server on backend
    if (socket.disconnected) {
      socket.open();
    }

    // subscribe to called channel
    setCalledCb((err, num) => {
      var c = num === this.state.patientID;
      this.setState({ isCalled: c });
    });

    // subscribe to update channel
    setUpdateCb((err, lst) => {
      var entry = lst.find((x) => {
        return x.id == this.state.patientID;
      });
      if (typeof entry === "undefined") {
        // the patientID is not registered (anymore)
        this.setState({ redirect: "/" + this.state.placeID });
      } else {
        this.setState({ waitingPosition: entry.pos });
      }
    });

    // subscribe to timing channel
    setTimingCb((err, dt) => this.setState({ minPerPerson: dt }));

    // fetch place information from placeID
    var apicall = APIendpoint + ":" + port + "/" + this.state.placeID;
    console.log("fetching placedetails");
    fetch(apicall)
      .then((response) => response.json())
      .then((data) => {
        this.setState({
          name: data.name,
          address: data.address,
          field: data.field,
        });
      })
      .catch(() => {
        console.log("could not fetch data. Backend inactive??");
        this.setState({ redirect: "/error" });
      });
  }

  componentWillUnmount() {
    socket.close();
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
            <Link to="/">Home</Link>
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
