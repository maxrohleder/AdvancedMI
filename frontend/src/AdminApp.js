import React from "react";
import Queue from "./components/queue";
import InfoBox from "./components/InfoBox";
import PatientManagement from "./components/PatMan";
import "./styles/AdminApp.css";

import PopUp from "./components/PopUp";
import io from "socket.io-client";

const APIendpoint = "http://localhost:8000/";
const updateRoute = "queue/";
const detailsRoute = "details/";

class AdminApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      placeID: props.match.params.placeID,

      name: null,
      address: null,
      field: null, // facharzt

      queueData: [], // [{patientinfo, pos}, {patientinfo, pos}]

      chatData: [
        {
          id: "jj97",
          chat: [
            {
              text: "Heyy jj97 Schreib mir...hier im ukerlangen",
              time: new Date().toLocaleTimeString(),
              speaker: "ukerlangen",
            },
          ],
        },
        {
          id: "mr98",
          chat: [
            {
              text: "Heyy mr98 Schreib mir...hier im ukerlangen",
              time: new Date().toLocaleTimeString(),
              speaker: "ukerlangen",
            },
          ],
        },
      ],

      chatToID: null,
      chatIndex: 0,
    };
  }

  socket = io.connect(APIendpoint, {
    autoConnect: false,
    query:
      "patDaten=" +
      this.props.match.params.placeID +
      " x+x " + //allow " " in praxisID
      this.props.match.params.placeID,
  });

  setChatCb = (cb) => {
    this.socket.on("chat", (dt) => {
      cb(null, dt);
    });
  };

  componentDidMount() {
    if (this.socket.disconnected) {
      this.socket.open();
    }
    // subscribe to chat channel and get praxis chat
    this.setChatCb((err, chat) => {
      console.log(chat);

      this.setState({ chatData: chat });
      console.log(this.state.chatData);
    });

    // fetch initial queue status
    var url = APIendpoint + updateRoute + this.state.placeID;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        this.setState({
          queueData: data.queueData,
        });
      })
      .catch(() => {
        console.log("could not fetch data. Backend inactive??");
        this.setState({ redirect: "/error" });
      });

    // fetch place information from placeID
    var url = APIendpoint + detailsRoute + this.state.placeID;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        this.setState({
          name: data.name,
          address: data.address,
          field: data.field,
        });
      })
      .catch(() => {
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
    var tmp = this.state.queueData;
    const index = tmp.indexOf(entry);
    if (index > -1) {
      tmp.splice(index, 1);
      this.setState({ queueData: tmp });
    }
  };

  handleChatData = (data) => {
    var url = APIendpoint + "chat/";
    var payload = JSON.stringify({
      chatData: data,
      patientID: this.state.chatToID, //tochange
      praxisID: this.state.placeID,
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
        console.log(data);
        var chat = this.state.chatData;
        chat[this.state.chatIndex].chat = data.chatData;
        this.setState({ chatData: chat });
        console.log(this.state.chatData[this.state.chatIndex].chat);
      })
      .catch(() => {
        console.log();
        this.setState({ redirect: "/error" });
      });
  };

  handleChange = (event) => {
    var target = event.target;
    console.log(target.id);

    if (target.id === "chkChatTo") {
      this.setState({ chatToID: event.target.value });
      //console.log("updated : " + target.id + " : " + this.state.chatToID);
    }
  };

  chekIfPatientenIDexists = (event) => {
    var index = this.state.chatData.findIndex((entry) => {
      return entry.id == this.state.chatToID;
    });
    //console.log(this.state.chatToID);
    //console.log(index);
    if (typeof index === -1) {
      alert("Bitte gueltige UserId eingeben");
    } else {
      console.log("index: " + index);
      //this.setState({ chatIndex: index });
      this.state.chatIndex = index;
    }
    console.log(this.state.chatIndex);
    //console.log(this.state.chatData[this.state.chatIndex].chat);
    event.preventDefault();
  };

  render() {
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
          />
        </div>
        <InfoBox />
        hier fenster mit eingabe zu wem man speakt//Wenn man neuen patienten
        anlegt bitte realoaden bvor man ihn anschreibt :D
        <form onSubmit={this.chekIfPatientenIDexists}>
          <label>
            <input
              type="text"
              name={"chkChatTo"}
              id={"chkChatTo"}
              onChange={this.handleChange}
            />
          </label>

          <br />

          <div>
            <input type="submit" value="talk_to" />
          </div>
        </form>
        <PopUp
          txt={"Open Chat Window"}
          speaker={this.state.placeID}
          praxisID={this.state.chatToID} //tochange//mit dem unteren verbinden vlt funktion die schau ob existerit und dann index zurückgibt
          chatData={this.state.chatData[this.state.chatIndex].chat} //herer to change get only chat data from specfic
          handleChatData={this.handleChatData} //braucht parameter praxis und patient
        />
      </div>
    );
  }
}

// export a single class
export default AdminApp;
