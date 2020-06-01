import React from "react";

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

  render() {
    var status = "";
    if (this.state.isCalled) {
      status = "called";
    }
    return (
      <li key={this.props.entrydata.patientID}>
        Patient {this.props.entrydata.patientID}
        {status}
        <button onClick={this.callPatient.bind(this)}>call</button>
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
      placeID={this.props.placeID}
    />
  );
  render() {
    return (
      <div>
        <div>People waiting: {this.props.data.length}</div>
        <ul>{this.props.data.map(this.renderEntries)}</ul>
      </div>
    );
  }
}

export default Queue;
