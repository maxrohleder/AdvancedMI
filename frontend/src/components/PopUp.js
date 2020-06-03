import React, { Component } from "react";
import ChatWindow from "./chatWindow";

class PopUpManager extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  handleClick = () => {
    this.props.toggle();
  };
  render() {
    return (
      <div>
        <div>
          <button onClick={this.handleClick}>x</button>
        </div>
        <ChatWindow
          speaker={this.props.speaker}
          praxisID={this.props.praxisID}
        />
      </div>
    );
  }
}
class PopUp extends Component {
  constructor(props) {
    super(props);
    this.state = { txt: props.txt, seen: false };
  }

  togglePop = () => {
    this.setState({
      seen: !this.state.seen,
    });
  };
  render() {
    return (
      <div>
        <div onClick={this.togglePop}>
          <button>{this.state.txt}</button>
        </div>
        {this.state.seen ? (
          <PopUpManager
            toggle={this.togglePop}
            speaker={this.props.speaker}
            praxisID={this.props.praxisID}
          />
        ) : null}
      </div>
    );
  }
}

export default PopUp;
