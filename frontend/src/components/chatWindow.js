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
          time: new Date().toLocaleTimeString(),
          speaker: this.state.speaker,
        },
      });
    }
  };

  handleSubmit = (event) => {
    var dummy = this.state.chat;
    if (dummy !== null) {
      var i = this.props.chatData.length - 1;
      if (i >= 0) {
        //publish same txt at different time//prevent duplicate
        var prevText = this.props.chatData[i].text;
        console.log("prevText: " + prevText);
        console.log("dummy: " + dummy.text);
        if (prevText === dummy.text) {
          dummy = {
            text: dummy.text,
            time: new Date().toLocaleTimeString(),
            speaker: dummy.speaker,
          };
        }
      }
      this.props.handleChatData(dummy);
    }
    event.preventDefault();
  };

  writeMessage = (e) => {
    var d = e.time;

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
            Hey <span>{this.state.speaker}</span> ich bin dein ChatWindow mit
            der Praxis <span>{this.state.praxisID}</span>
          </p>{" "}
          <br />
          {
            //JSON.stringify(this.props.chatData)
          }
          <div>{this.props.chatData.map((x) => this.writeMessage(x))}</div>
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
