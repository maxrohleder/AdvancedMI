import React from "react";
import "./styles/PatientApp.css";
import openSocket from "socket.io-client";
import "./styles/PatientApp.css";

const APIendpoint = "http://127.0.0.1";
const port = 8000;

const socket = openSocket(APIendpoint + ":" + port);

function setCalledCb(cb) {
  socket.on("called", (number) => {
    cb(null, number);
  });
}

class PatientApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      placeID: props.match.params.placeID,
      name: null,
      address: null,
      field: null,
      number: props.match.params.waitingID,
      called: null,
      waiting: null,
    };
    setCalledCb((err, num) => this.setState({ called: num }));
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
    if (this.state.number === this.state.called) {
      status = <div>Bitte in die Praxis kommen.</div>;
    } else {
      status = <div>Bitte warten.</div>;
    }

    return (
      <div>
        <div>
          {this.state.name} <br></br>
          {this.state.field} <br></br>
          {this.state.address} <br></br>
        </div>
        Your waiting number is: {this.state.number}
        {status}
      </div>
    );
  }
}

// export a single class
export default PatientApp;
