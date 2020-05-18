import React from "react";
import "./styles/PatientApp.css";
import openSocket from "socket.io-client";

const socket = openSocket("http://127.0.0.1:8000/");

function setCalledCb(cb) {
  socket.on("called", (number) => {
    cb(null, number);
  });
}

class PatientApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      number: props.match.params.waitingID,
      called: null,
      waiting: null,
    };
    setCalledCb((err, num) => this.setState({ called: num }));
  }

  render() {
    if (this.state.number == this.state.called) {
      return <div color="ffffff">Bitte in die Praxis kommen.</div>;
    } else {
      return <div color="000000">Bitte warten.</div>;
    }
  }
}

// export a single class
export default PatientApp;
