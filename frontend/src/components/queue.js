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

  removePatient() {}

  render() {
    var status = "";
    if (this.state.isCalled) {
      status = "called";
    }
    return (
      <div>
        Patient {this.props.entrydata.patientID}
        {status}
        <button onClick={this.callPatient.bind(this)}>call</button>
        <button onClick={this.props.cb.bind(this, this.props.entrydata)}>
          remove
        </button>
      </div>
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
    <QueueEntry entrydata={entry} cb={this.props.remove} />
  );
  render() {
    return (
      <div>
        <div>People waiting: {this.props.data.length}</div>
        <div>{this.props.data.map(this.renderEntries)}</div>
      </div>
    );
  }
}

export default Queue;
