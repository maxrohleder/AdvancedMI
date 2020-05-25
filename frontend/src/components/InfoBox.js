import React from "react";

class InfoBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: props.data,
    };
  }
  render() {
    return <div>Hinweise</div>;
  }
}

export default InfoBox;
