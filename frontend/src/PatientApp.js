import React from "react";
import "./styles/PatientApp.css";
import openSocket from "socket.io-client";
import "./styles/PatientApp.css";
import { ReactComponent as Logo } from "./img/doctor-svgrepo-com.svg";

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
      waitingNumber: null,
      called: null,
      waiting: null,
    };
    setCalledCb((err, num) => this.setState({ called: num }));
    socket.on("update", (e) => {
      var id = e.list.find((x) => x.id === this.state.number).waitingNumber;
      this.setState({ waitingNumber: id });
    });
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
          <div className="circle">{status}</div>
          Your waiting number is: {this.state.number}
        </div>
      </div>
    );
  }
}

// export a single class
export default PatientApp;
