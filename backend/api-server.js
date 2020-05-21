// inspired by https://www.valentinog.com/blog/socket-react/

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const port = 8000;

const getDetails = (placeID) => {
  return {
    name: "Praxis Dr. Covidweg",
    address: "Fledermausweg 19, 12020 Wuhan",
    field: "Allgemeinarzt",
  };
};

const updateWaitingNumber = () => {
  return {
    list: [
      { id: 5, waitingNumber: 5 },
      { id: 6, waitingNumber: 8 },
      { id: 7, waitingNumber: 6 },
      { id: 8, waitingNumber: 9 },
      { id: 9, waitingNumber: 1 },
      { id: 10, waitingNumber: 2 },
    ],
  };
};

// creating the http and socket server
const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socketIo(server);

// making sockets available in rest api
app.io = io;

// --------------------------------------------------------
// ---------------------all api routes---------------------
app.get("/", (req, res) => {
  res.send({ response: "I am alive" }).status(200);
});

app.get("/update", (req, res) => {
  req.app.io.emit("update", updateWaitingNumber());
  console.log("updated ", updateWaitingNumber());
  res
    .send({ response: "updated " + JSON.stringify(updateWaitingNumber()) })
    .status(200);
});

app.get("/:placeID", (req, res) => {
  var number = req.params.number;
  console.log("place details requested");
  res.send(getDetails(req.params.placeID)).status(200);
});

app.get("/call/:number", (req, res) => {
  var number = req.params.number;
  req.app.io.emit("called", number);
  console.log("emitted patient number ", number);
  res.send({ response: "called " + number }).status(200);
});

// ---------------------all api routes---------------------
// --------------------------------------------------------

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
