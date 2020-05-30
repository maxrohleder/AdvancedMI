import React from "react";
import Queue from "./components/queue";
import InfoBox from "./components/InfoBox";
import PatientManagement from "./components/PatMan";
import "./styles/AdminApp.css";

class AdminApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      praxisID: props.match.params.placeID, // TODO

      name: null,
      address: null,
      field: null, // facharzt

      queueData: [], // [{patientinfo, pos}, {patientinfo, pos}]
    };
    // insert some data to play with
    var dummy = {
      patientID: "mr98",
      first_name: "Max",
      surname: "Rohleder",
      appointment_date: new Date(),
      short_diagnosis: "Corona",
      mobile: "0123456789",
      email: "corona@covid19.de",
    };
    this.state.queueData = [...this.state.queueData, { ...dummy, pos: 1 }];
    console.log("mount " + this.state.queueData);
  }

  // used to add to queue state from PatMan
  appendToQueue = (e) => {
    console.log(e);
    var dummy = {
      patientID: e.patientID,
      first_name: e.first_name,
      surname: e.surname,
      appointment_date: e.appointment_date,
      short_diagnosis: e.short_diagnosis,
      mobile: e.mobile,
      email: e.email,
    };
    var newData = [...this.state.queueData, { ...dummy, pos: e.pos }];
    console.log("updated AdminApp State: " + newData);
    this.setState({ queueData: newData });
  };

  // used to remove from queue state from Queue
  deleteFromQueue = (entry) => {
    var tmp = this.state.queueData;
    const index = tmp.indexOf(entry);
    if (index > -1) {
      tmp.splice(index, 1);
      this.setState({ queueData: tmp });
    }
  };

  render() {
    return (
      <div>
        <h1>Welcome to the front desk of {this.state.name}!</h1>
        <div>
          <PatientManagement
            praxisID={this.state.praxisID}
            doChange={this.appendToQueue}
          />
          <Queue data={this.state.queueData} remove={this.deleteFromQueue} />
          <InfoBox />
        </div>
      </div>
    );
  }
}

// export a single class
export default AdminApp;
