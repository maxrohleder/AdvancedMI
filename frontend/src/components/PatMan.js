import React from "react";
import "../styles/AdminApp.css";
import { API_URL } from "../constants/all";

/*

Todos:
- send new patient info to backend and receive patientID and position
- modify data with new patientinfo and position

patientinfo {
    patientID: str,
    first_name: str,
    surname: str,
    appointment_date: Date(),
    short_diagnosis: str,
    mobile: number,
    email: str,
}

*/

// fully controlled component
class PatientManagement extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: props.data,

      id: null,

      first_name: "first_name",
      surname: "surname",
      appointment_date: "appointment_date",
      short_diagnosis: "short_diagnosis",
      mobile: "mobile",
      email: "email",
    };
  }
  handleChange = (event) => {
    var target = event.target;
    //console.log(target.id);

    if (target.id === "first_name") {
      if (event.target.value == "first_name") {
        this.setState({ first_name: "" });
        //console.log("updated : " + target.id + " : " + this.state.first_name);
      }
      this.setState({ first_name: event.target.value });
      //console.log("updated : " + target.id + " : " + this.state.first_name);
    }
    if (target.id === "surname") {
      this.setState({ surname: event.target.value });
      //console.log("updated : " + target.id + " : " + event.target.value);
    }
    if (target.id === "appointment_date") {
      this.setState({ appointment_date: event.target.value });
      //console.log("updated : " + target.id + " : " + event.target.value);
    }
    if (target.id === "short_diagnosis") {
      this.setState({ short_diagnosis: event.target.value });
      //console.log("updated : " + target.id + " : " + event.target.value);
    }
    if (target.id === "mobile") {
      this.setState({ mobile: event.target.value });
      //console.log("updated : " + target.id + " : " + event.target.value);
    }
    if (target.id === "email") {
      this.setState({ email: event.target.value });
      //console.log("email : " + target.id + " : " + event.target.value);
    }
  };

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
  // use a post request https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch
  handleSubmit = (event) => {
    var patientenData = {
      id: null, // filled in later
      pos: null,
      first_name: this.state.first_name,
      surname: this.state.surname,
      appointment_date: this.state.appointment_date,
      short_diagnosis: this.state.short_diagnosis,
      mobile: this.state.mobile,
      email: this.state.email,
    };
    this.setState({
      first_name: "first_name",
      surname: "surname",
      appointment_date: "appointment_date",
      short_diagnosis: "short_diagnosis",
      mobile: "mobile",
      email: "email",
    });
    //getAdminCookie
    var token = this.getAdminCookie();

    //post request
    var praxisID = this.props.praxisID;
    var url = API_URL + "admin/registerpatient/";
    var payload = JSON.stringify({
      placeID: praxisID,
      token: token,
      ...patientenData,
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
        patientenData.id = data.id;
        patientenData.pos = data.pos;
        // inform the queue component about new entry
        this.props.doChange(patientenData);
      })
      .catch((err) => {
        console.log(err);
        this.setState({ redirect: "/error" });
      });

    event.preventDefault();
  };

  render() {
    return (
      <div className={"patman"}>
        <form onSubmit={this.handleSubmit}>
          <label>
            Neuer Wartezimmer Gast:
            <input
              type="text"
              name="first_name"
              id="first_name"
              placeholder="First Name"
              value={this.state.first_name}
              onChange={this.handleChange}
            />
            <input
              type="text"
              name="surname"
              id="surname"
              value={this.state.surname}
              onChange={this.handleChange}
            />
            <input
              type="text"
              name="appointment_date"
              id="appointment_date"
              value={this.state.appointment_date}
              onChange={this.handleChange}
            />
            <input
              type="text"
              name="short_diagnosis"
              id="short_diagnosis"
              value={this.state.short_diagnosis}
              onChange={this.handleChange}
            />
            <input
              type="text"
              name="mobile"
              id="mobile"
              value={this.state.mobile}
              onChange={this.handleChange}
            />
            <input
              type="text"
              name="email"
              id="email"
              value={this.state.email}
              onChange={this.handleChange}
            />
          </label>
          <div>
            <input type="submit" value="Eintragen" />
          </div>
        </form>
      </div>
    );
  }
}

export default PatientManagement;
