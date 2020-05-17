import React from 'react';
import './styles/PatientApp.css';
import openSocket from 'socket.io-client';


const socket = openSocket('http://127.0.0.1:8000/');

function setCalledCb(cb) {
  socket.on('called', (number) => {
                          cb(null, number)
                        }
            );
}

class PatientApp extends React.Component {
    constructor(props) {
        super(props);  
        this.state = {
            called: null
        }
        setCalledCb(
          (err, num) => this.setState( { called: num } )
        );
    }

    render() {
      return (
        <div>patient called: { this.state.called }</div>
      );
    }
  }

// export a single class
export default PatientApp;