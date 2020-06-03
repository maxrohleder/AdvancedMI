import React, { Component } from "react";
import "../styles/ChatWindow.css";

class ChatWindow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chatData: this.props.chatData,
      chat: null,
      speaker: props.speaker,
      praxisID: props.praxisID,
    };
  }

  handleChange = (event) => {
    var target = event.target;
    //console.log(target.id);
    if (target.id === this.state.speaker) {
      this.setState({
        chat: {
          text: event.target.value,
          time: new Date(),
          speaker: this.state.speaker,
        },
      });
    }
  };

  handleSubmit = (event) => {
    var dummy = this.state.chat;
    if (this.state.chat !== null) {
      var i = this.state.chatData.length - 1;
      if (i >= 0) {
        //publish same txt at different time//prevent duplicate
        var prevText = this.state.chatData[i].text;
        if (prevText === dummy.text) {
          dummy = {
            text: dummy.text,
            time: new Date(),
            speaker: dummy.speaker,
          };
        }
      }
      this.props.handleChatData(dummy);
    }
    event.preventDefault();
  };

  writeMessage = (e) => {
    var d =
      e.time.getDate() +
      "." +
      (e.time.getMonth() + 1) +
      "." +
      e.time.getFullYear() +
      "  " +
      e.time.getHours() +
      ":" +
      e.time.getMinutes() +
      ":" +
      e.time.getSeconds() +
      ":" +
      e.time.getMilliseconds();

    var side = e.speaker === this.state.speaker ? "left" : "right";
    var txt = e.speaker + " | " + e.text + " | " + d + " | " + side;
    return (
      <div className={side} key={d}>
        <p>{txt}</p>
      </div>
    );
  };
  render() {
    return (
      <div className="chat-card">
        <div>
          <p>
            Hey ich bin dein ChatWindow mit der Praxis {this.state.praxisID}
          </p>{" "}
          <br />
          <div>{this.state.chatData.map((x) => this.writeMessage(x))}</div>
        </div>

        <form onSubmit={this.handleSubmit}>
          <label>
            <input
              type="text"
              name={this.state.speaker}
              id={this.state.speaker}
              onChange={this.handleChange}
            />
          </label>

          <br />

          <div>
            <input type="submit" value="Abschicken" />
          </div>
        </form>
      </div>
    );
  }
}

export default ChatWindow;
