import React from "react";
import "./styles/PatientApp.css";
import { Redirect, Link } from "react-router-dom";

import io from "socket.io-client";
import { ReactComponent as Logo } from "./img/doctor-svgrepo-com.svg";
import PopUp from "./components/PopUp";

const APIendpoint = "http://127.0.0.1:8000/";
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

      chatData: [],
    };
  }

  socket = io.connect(APIendpoint, {
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

  setChatCb = (cb) => {
    this.socket.on("chat", (dt) => {
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

    // subscribe to update channel
    this.setUpdateCb((err, pos) => {
      if (pos == null) {
        // the patientID is not registered (anymore)
        this.setState({ redirect: "/" + this.state.placeID });
      } else {
        this.setState({ waitingPosition: pos });
      }
    });

    // subscribe to timing channel
    this.setTimingCb((err, dt) => this.setState({ minPerPerson: dt }));

    // subscribe to chat channel
    this.setChatCb((err, chat) => {
      console.log("chat update.........");
      console.log(chat);
      if (chat[0].chat == null) {
        this.setState({ chatData: chat });
      } else {
        //nothing
        return;
      }
    });

    // fetch place information from placeID
    var apicall = APIendpoint + detailsRoute + this.state.placeID;
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
    this.socket.close();
  }

  handleChatData = (data) => {
    var url = APIendpoint + "chat/";
    var payload = JSON.stringify({
      chatData: data,
      patientID: this.state.patientID,
      praxisID: this.state.placeID,
    });
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
    };

    console.log("fetching admin info from " + url);
    fetch(url, requestOptions)
      .then((response) => response.json())
      .then((data) => {
        //
        //this.state.chatData = data.chatData;
        this.setState({ chatData: data.chatData });
      })
      .catch(() => {
        console.log();
        this.setState({ redirect: "/error" });
      });
  };

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
      <div>
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

        <PopUp
          txt={"Open Chat Window"}
          speaker={this.state.patientID}
          praxisID={this.state.placeID}
          chatData={this.state.chatData}
          handleChatData={this.handleChatData}
          chatRefresh={this.handleChatData}
        />
      </div>
    );
  }
}

// export a single class
export default PatientApp;
