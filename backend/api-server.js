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

const queue = {
  ukerlangen: [
    { id: "jj98", pos: 2 },
    { id: "mr98", pos: 3 },
    { id: "fh98", pos: 4 },
    { id: "cp97", pos: 1 },
  ],
  drcovid: [{ id: "bat1", pos: 1 }],
};

const updateWaitingNumber = () => {
  return queue;
};

// creating the http and socket server
const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socketIo(server);
io.origins("*:*");

// making sockets available in rest api
app.io = io;

// --------------------------------------------------------
// ---------------------all api routes---------------------
app.get("/", (req, res) => {
  res
    .send({ response: "This is the Digitales Wartezimmer Backend" })
    .status(200);
});

// will not need this method in the future as changes to the db will be emmited directly
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

app.get("/exists/:placeid/:patid", (req, res) => {
  var number = req.params.patid;
  console.log(number);
  var entry = queue.list.find((x) => x.id == number);
  if (typeof entry === "undefined") {
    // the patientID is not registered (anymore)
    console.log("patient not confirmed " + number);
    res.send({ userConfirmed: false }).status(200);
  } else {
    console.log("patient confirmed");
    res.send({ userConfirmed: true }).status(200);
  }
});

// ---------------------all api routes---------------------
// --------------------------------------------------------

// --------------------------------------------------------
// -------------------all socket cbs-----------------------
io.on("connection", (socket) => {
  console.log("New client connected");

  // send inital information
  socket.emit("update", updateWaitingNumber());
  socket.emit("timing", 10);

  // end timer on disconnect
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});
// -------------------all socket cbs-----------------------
// --------------------------------------------------------

server.listen(port, () => console.log(`listening on http://127.0.0.1:` + port));
