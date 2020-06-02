import React, { Component } from "react";
class ChatWindow extends Component {
  constructor(props) {
    super(props);
    this.state = { chatData: [], chat: null, speaker: "props.speaker" };
  }

  handleChange = (event) => {
    var target = event.target;
    console.log(target.id);
    if (target.id === "user") {
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
    if (this.state.chat !== null) {
      var dummy = this.state.chat;
      var newData = [...this.state.chatData, { ...dummy }];
      this.setState({ chatData: newData });
      event.preventDefault();
    }
  };

  writeMessage = (e) => {
    var date =
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

    var txt = e.speaker + " | " + e.text + " | " + date;
    return (
      <div>
        <p>{txt}</p>
      </div>
    );
  };
  render() {
    return (
      <div>
        <div>
          hey <br />
          <div>{this.state.chatData.map((x) => this.writeMessage(x))}</div>
        </div>

        <form onSubmit={this.handleSubmit}>
          <label>
            <input
              type="text"
              name="user"
              id="user"
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
