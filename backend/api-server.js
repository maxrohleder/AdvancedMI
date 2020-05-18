// inspired by https://www.valentinog.com/blog/socket-react/

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const router = express.Router();

const port = 8000;


WAITING = []
CALLED = []

// --------------------------------------------------------
// ---------------------all api routes---------------------
router.get("/", (req, res) => {
  res.send({ response: "I am alive" }).status(200);
});

router.get("/call/:number", (req, res) => {
    var number = req.params.number;
    req.app.io.emit('called', number);
    console.log("emitted patient number ", number)
    res.send({ response: 'called ' + number }).status(200);
});
// ---------------------all api routes---------------------
// --------------------------------------------------------

// creating the http and socket server
const app = express();
app.use(router);
const server = http.createServer(app);
const io = socketIo(server);

// making sockets available in rest api
app.io = io;

// --------------------------------------------------------
// -------------------all socket cbs-----------------------
io.on("connection", (socket) => {
  console.log("New client connected");

  // end timer on disconnect
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});
// -------------------all socket cbs-----------------------
// --------------------------------------------------------

server.listen(port, () => console.log(`listening on http://127.0.0.1:8000`));