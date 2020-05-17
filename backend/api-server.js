const Server = require('socket.io');
const io = new Server();

WAITING = [11, 12, 13, 14, 15]
CALLED = [11, 12]

io.on('connection', (client) => {
    // this code is active as long as the client is connected

    client.on('setTimer', (interval) => {
        // this is the callback for a event invoked by the client
        
        console.log('client wants to set a timer for ', interval);
        // set an Interval Timer, which emits a time update every interval milliseconds
        setInterval(
            () => { 
                client.emit('timeChannel', new Date()); 
                console.log('new time sent') 
                }, 
            interval
        );
    });
});

io.o

const port = 8000;
io.listen(port);
console.log('api on port ', port);