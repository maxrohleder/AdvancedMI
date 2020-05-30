import React from "react";

/*

todos:
- display patientinfo and two buttons
- button "call" --> api request on /call/:patid
- button "remove" --> api request on /remove/:patid

future:
- drag and drop --> position change
 
 */

class Queue extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    console.log(this.props.data);
    return <div>{JSON.stringify(this.props.data)}</div>;
  }
}

export default Queue;
