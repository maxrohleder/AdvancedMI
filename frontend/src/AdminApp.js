import React from "react";
import Queue from "./components/queue";
import InfoBox from "./components/InfoBox";
import PatientManagement from "./components/PatMan";
import "./styles/AdminApp.css";

class AdminApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      praxisID: null, // TODO

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

  render() {
    return (
      <div>
        <h1>Welcome to the front desk of {this.props.match.params.placeId}!</h1>
        <a href="http://localhost:3000">Home</a>
        <div>
          <PatientManagement data={this.state.queueData} />
          <Queue data={this.state.queueData} />
          <InfoBox />
        </div>
      </div>
    );
  }
}

// export a single class
export default AdminApp;
