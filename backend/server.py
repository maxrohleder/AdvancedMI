from flask import Flask, render_template
from flask_socketio import SocketIO, join_room, emit, send
import threading

# initialize Flask
app = Flask(__name__)
socketio = SocketIO(app)
ROOM = 'Wartezimmer'

@app.route('/')
def index():
    emit('general', )
    info = "<!DOCTYPE html>\
            <html lang=\"en\">\
            <head></head>\
            <body>\
                <div>This is the API endpoint for virtual waiting rooms.</div>\
            </body>\
            </html>"
    return info

@socketio.on('join')
def on_join(data):
    print("join request")
    username = data['username']
    room = data['room']
    join_room(room)
    send(username + ' has entered the room.', room=room)

@socketio.on('subscribeToRoom')
def assign_room(data):
    print("room subscription")
    print("connection established")
    emit('general', ROOM)

if __name__ == '__main__':
    socketio.run(app, debug=True)