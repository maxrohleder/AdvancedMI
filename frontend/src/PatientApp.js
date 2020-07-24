import React from "react";
import "./styles/PatientApp.css";
import { Redirect, Link } from "react-router-dom";

import io from "socket.io-client";
import { ReactComponent as Logo } from "./img/doctor-svgrepo-com.svg";
import { API_URL } from "./constants/all";

const detailsRoute = "details/";
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

  socket = io.connect(API_URL, {
    autoConnect: false,
    query:
      "patDaten=" +
      this.props.match.params.placeID +
      " x+x " + //allow " " in praxisID
      this.props.match.params.patientID,
  });

  setCalledCb = (cb) => {
    this.socket.on("called", (patId) => {
      cb(null, patId);
    });
  };

  setUnCalledCb = (cb) => {
    this.socket.on("uncalled", (patId) => {
      cb(null, patId);
    });
  };

  setUpdateCb = (cb) => {
    this.socket.on("update", (data) => {
      cb(null, data);
    });
  };

  setTimingCb = (cb) => {
    this.socket.on("timing", (dt) => {
      cb(null, dt);
    });
  };

  componentDidMount() {
    // connect to real-time server on backend
    if (this.socket.disconnected) {
      this.socket.open();
    }

    // subscribe to called channel
    this.setCalledCb((err, num) => {
      var c = num === this.state.patientID;
      this.setState({ isCalled: c });
    });

    // subscribe to called channel
    this.setUnCalledCb((err, num) => {
      this.setState({ isCalled: false });
    });

    // subscribe to update channel
    this.setUpdateCb((err, data) => {
      console.log(data);
      var pos = data.split("+")[1];
      if (data.split("+")[0] == this.state.patientID) {
        if (pos == "null") {
          // the patientID is not registered (anymore)
          this.setState({ redirect: "/place/" + this.state.placeID });
        } else {
          this.setState({ waitingPosition: pos });
        }
      } else {
        console.log(
          "fetching position " +
            API_URL +
            "/update/" +
            this.state.placeID +
            "/" +
            this.state.patientID
        );
        fetch(
          API_URL + "update/" + this.state.placeID + "/" + this.state.patientID
        )
          .then((response) => response.json())
          .then((data) => {
            this.setState({ waitingPosition: data.pos });
          })
          .catch(() => {
            console.log();
            this.setState({ redirect: "/error" });
          });
      }
    });

    // subscribe to timing channel
    this.setTimingCb((err, dt) => this.setState({ minPerPerson: dt }));

    // fetch place information from placeID
    var apicall = API_URL + detailsRoute + this.state.placeID;
    console.log("fetching placedetails");
    fetch(apicall)
      .then((response) => response.json())
      .then((data) => {
        //console.log(data);
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
    this.socket.close();
  }

  render() {
    // Redirect to login screen if the patientID was not found
    if (this.state.redirect) {
      return <Redirect to={this.state.redirect} />;
    }

    let status;
    if (this.state.isCalled) {
      status = (
        <React.Fragment>
          Let's go:
          <div className="circle-green-haken"></div>
          <div>Bitte in die Praxis kommen.</div>
        </React.Fragment>
      );
    } else {
      var timeEstimate = this.state.waitingPosition * this.state.minPerPerson;
      status = (
        <React.Fragment>
          Patienten vor Ihnen:
          <div className="circle">{this.state.waitingPosition}</div>
          <div>
            Ihre ungefähre Wartezeit beträgt <br />
            <span>{timeEstimate} Minuten.</span>
          </div>
        </React.Fragment>
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

        <div className="card">{status}</div>
      </div>
    );
  }
}

// export a single class
export default PatientApp;
