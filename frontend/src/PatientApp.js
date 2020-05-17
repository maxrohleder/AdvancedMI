import React from 'react';
import './styles/PatientApp.css';
import openSocket from 'socket.io-client';


const socket = openSocket('http://127.0.0.1:5000/');

function subscribeToRoom(cb) {
  socket.join('general', (room_name) => {
                          console.log(room_name);
                          cb(null, room_name)
                        }
            );
}

class PatientApp extends React.Component {
    constructor(props) {
        super(props);  
        this.state = {
            room: 'not set yet'
        }
        subscribeToRoom(
          (err, name) => this.setState( { room: name } )
        );
    }

    render() {
      return (
        <div>timestamp: { this.state.room }</div>
      );
    }
  }

// export a single class
export default PatientApp;