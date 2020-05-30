// inspired by https://www.valentinog.com/blog/socket-react/

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const port = 8000;

////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////

const getDetails = (placeID) => {
  return {
    name: "Praxis Dr. Covidweg",
    address: "Fledermausweg 19, 12020 Wuhan",
    field: "Allgemeinarzt",
  };
};

const queue = {
  ukerlangen: [
    { id: "jj97", pos: 1337 },
    { id: "mr98", pos: 3 },
    { id: "fh98", pos: 4 },
    { id: "cp97", pos: 1 },
  ],
  drcovid: [{ id: "bat1", pos: 1 }],
};

const praxen = {
  praxisToPassword: [
    { praxisID: "ukerlangen", password: "123" },
    { praxisID: "covidTestLabor", password: "666" },
    { praxisID: "waschmaschienenPortal", password: "333" },
    { praxisID: "a", password: "a" },
  ],
};
var patientenDaten = {
  ukerlangen: [],
};

const updateWaitingNumber = () => {
  return queue;
};

////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////

// creating the http and socket server
const app = express();
app.use(cors());
app.use(express.json());
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

app.get("/exists/admin/:praxisID/:password", (req, res) => {
  var praxisID = req.params.praxisID;
  var password = req.params.password;
  var entry = praxen.praxisToPassword.find((x) => x.praxisID == praxisID);

  console.log("placeID: " + praxisID);
  console.log("password: " + password);
  console.log("entry: " + entry);

  if (typeof entry === "undefined") {
    // the praxis does not exist
    console.log("praxis does not exist " + praxisID);
    res.send({ praxisConfirmed: false }).status(200);
  } else {
    console.log("check passwort for praxis: " + praxisID);
    if (entry.password == password) {
      console.log("password correct");
      res.send({ praxisConfirmed: true }).status(200);
    } else {
      console.log("password false");
      res.send({ praxisConfirmed: false }).status(200);
    }
  }
});
app.get("/exists/user/:praxisID/:patID", (req, res) => {
  var praxisID = req.params.praxisID;
  var number = req.params.patID;
  var entry = praxen.praxisToPassword.find((x) => x.praxisID == praxisID);

  console.log("praxisID: " + praxisID);
  console.log("number: " + number);
  console.log("entry: " + entry);

  if (typeof entry === "undefined") {
    // the praxis does not exist
    console.log("praxis does not exist " + praxisID);
    res.send({ praxisConfirmed: false }).status(200);
  } else {
    console.log("praxis does exist " + praxisID);
    //res.send({ praxisConfirmed: true}).status(200);

    entry = queue.ukerlangen.find((x) => x.id == number);
    if (typeof entry === "undefined") {
      // the patientID is not registered (anymore)
      console.log("patient not confirmed " + number);
      res.send({ praxisConfirmed: true, userConfirmed: false }).status(200);
    } else {
      console.log("patient confirmed");
      res.send({ praxisConfirmed: true, userConfirmed: true }).status(200);
    }
  }
});

// Ändern auf POST request https://jasonwatmore.com/post/2020/02/01/react-fetch-http-post-request-examples
app.get(
  "/admin/register/:praxisID/:first_name/:surname/:appointment_date/:short_diagnosis/:mobile/:email",
  (req, res) => {
    var first_name = req.params.first_name;
    var surname = req.params.surname;
    var appointment_date = req.params.appointment_date;
    var short_diagnosis = req.params.short_diagnosis;
    var mobile = req.params.mobile;
    var email = req.params.email;

    console.log("first_name: " + first_name);
    console.log("surname: " + surname);
    console.log("appointment_date: " + appointment_date);
    console.log("short_diagnosis: " + short_diagnosis);
    console.log("mobile: " + mobile);
    console.log("email: " + email);

    var praxisID = req.params.praxisID; //to add to praxisID

    //HIER DATABASE
    patientenDaten.ukerlangen.push({
      first_name: first_name,
      surname: surname,
      appointment_date: appointment_date,
      short_diagnosis: short_diagnosis,
      mobile: mobile,
      email: email,
    });

    console.log(patientenDaten);

    //position und patientenID von Database
    var patID = patientenDaten.ukerlangen.length;
    var pos = patientenDaten.ukerlangen.length;

    res
      .send({ response: "patient eingefuegt", id: patID, pos: pos })
      .status(200);
  }
);

app.post("/call", (req, res) => {
  console.log(
    "patient " + req.body.patientID + " called: " + req.body.isCalled
  );
  res.send().status(200);
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
