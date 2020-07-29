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
      goodbye: null,
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
    this.socket.on("call", (patId) => {
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
    this.setCalledCb((err, data) => {
      var patID = data;
      if (patID === this.state.patientID) {
        var t = this.state.isCalled === true ? false : true;
        this.setState({ isCalled: t });
      }
    });

    // subscribe to update channel
    this.setUpdateCb((err, data) => {
      console.log(data);
      if (data == null || data == undefined) {
        console.log("redirecting to: /place/" + this.state.placeID);
        this.setState({ redirect: "/place/" + this.state.placeID });
      } else {
        var patient = data.find((x) => {
          return x.id == this.state.patientID;
        });
        if (patient == undefined) {
          if (this.state.isCalled != null) {
            console.log(
              this.state.patientID + " " + "VIELEN DANK FÜR DEN AUFENHALT!"
            );
            console.log("redirecting to: /place/" + this.state.placeID);
            this.setState({
              goodbye: true,
              redirect: "/place/" + this.state.placeID,
            });
          } else {
            console.log("redirecting to: /place/" + this.state.placeID);
            this.setState({ redirect: "/place/" + this.state.placeID });
          }
        } else {
          var pos = patient.pos;
          var called = patient.called;
          this.setState({ waitingPosition: pos, isCalled: called });
        }
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
    if (this.state.goodbye) {
      return (
        <Redirect
          to={{
            pathname: this.state.redirect,
            state: { goodbye: true },
          }}
        />
      );
    }
    if (this.state.redirect) {
      return <Redirect to={this.state.redirect} />;
    }

    let status;
    if (this.state.isCalled) {
      var vib = window.navigator.vibrate([1000, 500, 1000]);
      console.log("vibrated: ", vib);
      status = (
        <React.Fragment>
          <div>Deine Identifikation: {this.state.patientID}</div>
          <div className="called-circle">
            <span>✓</span>
          </div>
          <div>Bitte in die Praxis kommen.</div>
        </React.Fragment>
      );
    } else {
      var timeEstimate = this.state.waitingPosition * this.state.minPerPerson;
      status = (
        <React.Fragment>
          Patienten vor Ihnen:
          <div className="circle">{this.state.waitingPosition - 1}</div>
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
