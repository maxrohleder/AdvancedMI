import React from "react";

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
    };
  }

  render() {
    return <div>Patienten Management</div>;
  }
}

export default PatientManagement;
