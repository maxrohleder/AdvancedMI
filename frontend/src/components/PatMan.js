import React from "react";
import "../styles/PatMan.css";

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

class PatientManagement extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: props.data,

      patientID: null,

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
    console.log(target.id);

    if (target.id === "first_name") {
      if (event.target.value == "first_name") {
        this.setState({ first_name: "" });
        console.log("updated : " + target.id + " : " + this.state.first_name);
      }
      this.setState({ first_name: event.target.value });
      console.log("updated : " + target.id + " : " + this.state.first_name);
    }
    if (target.id === "surname") {
      this.setState({ surname: event.target.value });
      console.log("updated : " + target.id + " : " + event.target.value);
    }
    if (target.id === "appointment_date") {
      this.setState({ appointment_date: event.target.value });
      console.log("updated : " + target.id + " : " + event.target.value);
    }
    if (target.id === "short_diagnosis") {
      this.setState({ short_diagnosis: event.target.value });
      console.log("updated : " + target.id + " : " + event.target.value);
    }
    if (target.id === "mobile") {
      this.setState({ mobile: event.target.value });
      console.log("updated : " + target.id + " : " + event.target.value);
    }
    if (target.id === "email") {
      this.setState({ praxisID: event.target.value });
      console.log("email : " + target.id + " : " + event.target.value);
    }
  };

  handleSubmit = (event) => {
    var data = {
      patientID: 5,
      first_name: this.state.first_name,
      surname: this.state.surname,
      appointment_date: this.state.appointment_date,
      short_diagnosis: this.state.short_diagnosis,
      mobile: this.state.mobile,
      email: this.state.email,
      pos: 55,
    };
    console.log("data from patman: " + data);
    this.props.doChange(data);
    event.preventDefault();
  };

  render() {
    return (
      <div className={"container-patman"}>
        <form onSubmit={this.handleSubmit}>
          <label>
            PatientenDaten:
            <input
              type="text"
              name="first_name"
              id="first_name"
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
          <br />
          <div className="container-button-todo">
            <input type="submit" value="Eintragen" />
          </div>
        </form>
        <br />
        <br />
      </div>
    );
  }
}

export default PatientManagement;
