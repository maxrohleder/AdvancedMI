import React from 'react';
import './styles/PatientApp.css';
import openSocket from 'socket.io-client';


const socket = openSocket('http://127.0.0.1:8000/');

function setTimer(cb) {
  socket.on('timeChannel', (time) => {
                          cb(null, time)
                        }
            );
  socket.emit('setTimer', 1000);
}

class PatientApp extends React.Component {
    constructor(props) {
        super(props);  
        this.state = {
            time: 'not set yet'
        }
        setTimer(
          (err, new_time) => this.setState( { time: new_time } )
        );
    }

    render() {
      return (
        <div>timestamp: { this.state.time }</div>
      );
    }
  }

// export a single class
export default PatientApp;