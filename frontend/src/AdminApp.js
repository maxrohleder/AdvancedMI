import React from "react";
import Queue from "./components/queue";
import InfoBox from "./components/InfoBox";
import PatientManagement from "./components/PatMan";
import { Redirect } from "react-router-dom";
import "./styles/AdminApp.css";

const APIendpoint = "http://localhost:8000/";
const updateRoute = "admin/queue";
const detailsRoute = "admin/details";

class AdminApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isAuth: false,
      placeID: props.match.params.placeID,

      name: null,
      address: null,
      field: null, // facharzt

      queueData: [], // [{patientinfo, pos}, {patientinfo, pos}]
      redirect: null,
    };
  }
  getAdminCookie = () => {
    function escape(s) {
      return s.replace(/([.*+?\^${}()|\[\]\/\\])/g, "\\$1");
    }
    var match = document.cookie.match(
      RegExp("(?:^|;\\s*)" + escape("Access-Token") + "=([^;]*)")
    );
    var token = match ? match[1] : null;
    return token.split("praxisID=")[0];
  };

  componentDidMount() {
    //getAdminCookie
    var token = this.getAdminCookie();
    var placeID = this.state.placeID;

    // fetch initial queue status
    var url = APIendpoint + updateRoute;
    var payload = JSON.stringify({
      placeID: placeID,
      token: token,
    });
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
    };
    var auth = false;
    fetch(url, requestOptions)
      .then((response) => response.json())
      .then((data) => {
        //console.log(data);
        this.setState({
          queueData: data.queueData,
        });
      })
      .catch((err) => {
        if (!auth) {
          console.log("falschesToken");
          alert("Use Valid Token");
          document.cookie =
            "Access-Token= null " + "; path = / " + "; max-age = " + 0; //cant destroy expiration->0sec
          this.setState({ redirect: "/" });
        }
        console.log(
          "ComponentMount AdminApp: could not fetch data. Backend inactive??",
          err
        );
        this.setState({ redirect: "/error" });
      });

    // fetch place information from placeID
    url = APIendpoint + detailsRoute;
    fetch(url, requestOptions)
      .then((response) => response.json())
      .then((data) => {
        auth = data.authConfirmed;
        this.setState({
          name: data.details.name,
          address: data.details.address,
          field: data.details.field,
        });
      })
      .catch(() => {
        if (!auth) {
          console.log("falschesToken");
          alert("Use Valid Token");
          document.cookie =
            "Access-Token= null " + "; path = / " + "; max-age = " + 0; //cant destroy expiration->0sec
          this.setState({ redirect: "/" });
        }
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
    console.log(entry);
    var tmp = this.state.queueData;
    const index = tmp.indexOf(entry);
    if (index > -1) {
      tmp.splice(index, 1);
      this.setState({ queueData: tmp });
    }
  };

  // used to remove from queue state from Queue
  moveQueue = (entry) => {
    this.setState({ queueData: entry });
  };

  handleClick = () => {
    console.log("DELETE COOKIE");
    document.cookie =
      "Access-Token= null " + "; path = / " + "; max-age = " + 0; //cant destroy expiration->0sec
    this.setState({ redirect: "/" });
  };
  render() {
    if (this.state.redirect) {
      console.log("redirecting to: " + this.state.redirect);
      return <Redirect to={this.state.redirect} />;
    }

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
            move={this.moveQueue}
          />
          <div className="logOut-button">
            <input onClick={this.handleClick} defaultValue="⮕ LOG OUT" />
          </div>
        </div>
        <InfoBox />
      </div>
    );
  }
}

// export a single class
export default AdminApp;
