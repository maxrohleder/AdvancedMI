import React from "react";
import "./styles/PatientApp.css";
import openSocket from "socket.io-client";
import "./styles/PatientApp.css";
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
    };

    // subscribe to called
    setCalledCb((err, num) => {
      var c = num === this.state.patientID;
      this.setState({ isCalled: c });
    });

    // subscribe to update
    setUpdateCb((err, lst) => {
      var pos = lst.find((x) => x.id == this.state.patientID).pos;
      this.setState({ waitingPosition: pos });
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
          <div>Home</div>
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
