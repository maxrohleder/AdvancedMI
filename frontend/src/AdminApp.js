import React from "react";
import Queue from "./components/queue";
import InfoBox from "./components/InfoBox";
import PatientManagement from "./components/PatMan";
import "./styles/AdminApp.css";

const APIendpoint = "http://localhost:8000/";
const updateRoute = "queue/";
const detailsRoute = "details/";

class AdminApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      placeID: props.match.params.placeID,

      name: null,
      address: null,
      field: null, // facharzt

      queueData: [], // [{patientinfo, pos}, {patientinfo, pos}]
    };
  }

  componentDidMount() {
    // fetch initial queue status
    var url = APIendpoint + updateRoute + this.state.placeID;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        this.setState({
          queueData: data.queueData,
        });
      })
      .catch(() => {
        console.log("could not fetch data. Backend inactive??");
        this.setState({ redirect: "/error" });
      });

    // fetch place information from placeID
    var url = APIendpoint + detailsRoute + this.state.placeID;
    fetch(url)
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
      <div className="app">
        <div className="banner">
          <h1>Wartezimmer {this.state.name}!</h1>
        </div>
        <div className="main">
          <PatientManagement
            praxisID={this.state.placeID}
            doChange={this.appendToQueue}
            className="patman"
          />
          <Queue
            placeID={this.state.placeID}
            data={this.state.queueData}
            remove={this.deleteFromQueue}
          />
        </div>
        <InfoBox />
      </div>
    );
  }
}

// export a single class
export default AdminApp;
