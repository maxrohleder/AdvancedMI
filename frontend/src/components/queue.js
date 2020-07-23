import React from "react";
import "../styles/AdminApp.css";

/*

todos:
- display patientinfo and two buttons
- button "call" --> api request on /call/:patid
- button "remove" --> api request on /remove/:patid

future:
- drag and drop --> position change

patientinfo {
    patientID: str,
    first_name: str,
    surname: str,
    appointment_date: Date(),
    short_diagnosis: str,
    mobile: number,
    email: str,
}

queuedata: [{..patientinfo, pos}, {..patientinfo, pos}]
 

*/

const APIendpoint = "http://localhost:8000/";
const callRoute = "call";
const delRoute = "del";
const moveRoute = "move";

// stateless component
class QueueEntry extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isCalled: false,
    };
  }

  callPatient() {
    // set state and inform backend
    var newIsCalled = !this.state.isCalled;
    this.setState({ isCalled: newIsCalled });
    var url = APIendpoint + callRoute;
    var payload = JSON.stringify({
      patientID: this.props.entrydata.patientID,
      isCalled: newIsCalled,
    });
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
    };
    fetch(url, requestOptions);
  }

  removePatient() {
    console.log("removing patient");
    var url = APIendpoint + delRoute;
    var payload = JSON.stringify({
      placeID: this.props.placeID,
      patientID: this.props.entrydata.patientID,
    });
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
    };
    console.log(url);
    console.log(payload);
    console.log(this.props.placeID);
    fetch(url, requestOptions);
    this.props.cb(this.props.entrydata);
  }

  move = (direction) => {
    //console.log("moving patient " + direction);
    var tmp = this.props.data;
    var index = tmp.indexOf(this.props.entrydata);

    //console.log(this.props.data);
    var url = APIendpoint + moveRoute;
    var payload = JSON.stringify({
      placeID: this.props.placeID,
      patientID: this.props.entrydata.patientID,
      direction: direction,
      index: index,
    });
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
    };

    if (direction == "down") {
      if (index != Object.keys(tmp).length - 1) {
        console.log("NACH UNTEN SCHIEBEN");
        var pat = tmp[index];
        tmp[index] = tmp[index + 1];
        tmp[index + 1] = pat;
        fetch(url, requestOptions);
      }
    } else {
      if (index != 0) {
        console.log("NACH OBEN SCHIEBEN");
        var pat = tmp[index];
        tmp[index] = tmp[index - 1];
        tmp[index - 1] = pat;
        fetch(url, requestOptions);
      }
    }
    //manchmal zu schnell so dass backend nicht hinterherkommt
    //vlt n await adden
    this.props.move(tmp);
  };

  render() {
    var status = "";
    if (this.state.isCalled) {
      status = "called";
    }
    return (
      <li key={this.props.entrydata.patientID}>
        Patient {this.props.entrydata.patientID},{" "}
        {this.props.entrydata.first_name}, {this.props.entrydata.surname},{" "}
        {this.props.entrydata.appointment_date},{" "}
        {this.props.entrydata.short_diagnosis}, {this.props.entrydata.mobile}{" "}
        {status}
        <button onClick={this.callPatient.bind(this)}>call</button>
        <button onClick={() => this.move("up")}>↑</button>
        <button onClick={() => this.move("down")}>↓</button>
        <button onClick={this.removePatient.bind(this)}>remove</button>
      </li>
    );
  }
}

// stateless component
class Queue extends React.Component {
  constructor(props) {
    super(props);
    this.renderEntries = this.renderEntries.bind(this);
  }
  renderEntries = (entry) => (
    <QueueEntry
      key={entry.patientID}
      entrydata={entry}
      cb={this.props.remove}
      move={this.props.move}
      placeID={this.props.placeID}
      data={this.props.data}
    />
  );
  notEmpty = () => {
    if (
      this.props.data !== null &&
      this.renderEntries !== null &&
      this.props.data !== undefined
    ) {
      return <ol>{this.props.data.map(this.renderEntries)}</ol>;
    }
  };
  render() {
    return <div className="overview">{this.notEmpty()}</div>;
  }
}

export default Queue;
