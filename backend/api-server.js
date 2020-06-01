// inspired by https://www.valentinog.com/blog/socket-react/

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const port = 8000;

////////////////////////////////////////////////////////////
/////////////////// database wrapper ///////////////////////
////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////

var db = {
  ukerlangen: {
    password: "123",
    details: {
      name: "Universitätsklinikum Erlangen",
      address: "Östliche Stadtmauerstraße 4, 91052 Erlangen",
      field: "Virologie",
    },
    queue: [
      { id: "jj97", pos: 1 },
      { id: "mr98", pos: 2 },
    ],
    patientData: [
      {
        patientID: "mr98",
        first_name: "Max",
        surname: "Rohleder",
        appointment_date: new Date(),
        short_diagnosis: "Corona",
        mobile: "0123456789",
        email: "corona@covid19.de",
      },
      {
        patientID: "jj98",
        first_name: "Jule",
        surname: "Verne",
        appointment_date: new Date(),
        short_diagnosis: "Corona",
        mobile: "0123456789",
        email: "corona@covid19.de",
      },
    ],
  },
  drcovid: {
    password: "666",
    details: {
      name: "Praxis Dr. Covidweg",
      address: "Fledermausweg 19, 12020 Wuhan",
      field: "Allgemeinarzt",
    },
    queue: [],
    patientData: [],
  },
};

const getDetails = (placeID) => {
  return db[placeID].details;
};

const registerPatient = (placeID, pd) => {
  var match = db[placeID].patientData.find((entry) => {
    pd.first_name === entry.first_name &&
      pd.surname === entry.surname &&
      pd.appointment_date === entry.appointment_date &&
      pd.short_diagnosis === entry.short_diagnosis &&
      pd.mobile === entry.mobile &&
      pd.email === entry.email;
  });

  if (typeof match !== "undefined") {
    return match.patientID;
  } else {
    var patId = createUID(placeID, pd.first_name, pd.surname);
    db[placeID].patientData.push({
      patientID: patId,
      first_name: pd.first_name,
      surname: pd.surname,
      appointment_date: pd.appointment_date,
      short_diagnosis: pd.short_diagnosis,
      mobile: pd.mobile,
      email: pd.email,
    });
    return patId;
  }
};

const removeFromQueue = (placeID, patientID) => {
  console.log("[deletePatient]: deleting " + patientID);
  var newQueue = db[placeID].queue.filter((entry) => {
    return entry.id !== patientID;
  });
  db[placeID].queue = newQueue;
};

const updateWaitingNumber = (placeID) => {
  return db[placeID].queue;
};

const createUID = (placeID, first, sur) => {
  // create an place-unique patientID from first and surname
  var id = first.substring(0, 2) + sur.substring(0, 2);
  while (db[placeID].queue.some((entry) => entry.id === id)) {
    id += "I";
  }
  return id;
};

const queuePatient = (placeID, patientID) => {
  // place patientID in queue and return position
  var lastPosition = 1;
  for (let i = 0; i < db[placeID].queue.length; i++) {
    var tmp = db[placeID].queue[i].pos;
    lastPosition = lastPosition > tmp ? lastPosition : tmp;
  }
  lastPosition += 1; // next free last position
  db[placeID].queue.push({ id: patientID, pos: lastPosition });
  console.log(db[placeID].queue);
  return lastPosition;
};

////////////////////////////////////////////////////////////
/////////////////// database wrapper ///////////////////////
////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////

// creating the http and socket server
const app = express();
app.use(cors());
app.use(express.json()); // for post calls in json format
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

app.get("/:placeID", (req, res) => {
  console.log("place details requested");
  res.send(getDetails(req.params.placeID)).status(200);
});

app.get("/exists/admin/:placeID/:password", (req, res) => {
  var placeID = req.params.placeID;
  var password = req.params.password;
  var placeExists = db.hasOwnProperty(placeID);
  var existsAndConfirmed = placeExists && db[placeID].password == password;
  res.send({ praxisConfirmed: existsAndConfirmed }).status(200);
});

app.get("/exists/user/:placeID/:patID", (req, res) => {
  var placeID = req.params.placeID;
  var patientID = req.params.patID;

  // check if place exists
  var placeExists = db.hasOwnProperty(placeID);

  entry = db[placeID].queue.find((x) => x.id == patientID);
  res
    .send({
      praxisConfirmed: placeExists,
      userConfirmed: placeExists && typeof entry !== "undefined",
    })
    .status(200);
});

// register a new patient and return its patientID and position
app.post("/admin/registerpatient/", (req, res) => {
  // create a patientID
  var placeID = req.body.placeID;

  // register patient details if not existant and return a unique id
  var patientID = registerPatient(placeID, {
    first_name: req.body.first_name,
    surname: req.body.surname,
    appointment_date: req.body.appointment_date,
    short_diagnosis: req.body.short_diagnosis,
    mobile: req.body.mobile,
    email: req.body.email,
  });

  // place patient into queue
  var pos = queuePatient(placeID, patientID);

  // inform admin interface about patientID and position
  res
    .send({ response: "registered patient", id: patientID, pos: pos })
    .status(200);
});

app.post("/call", (req, res) => {
  var channel = req.body.isCalled ? "called" : "uncalled";
  req.app.io.emit(channel, req.body.patientID);
  console.log(channel + " " + req.body.patientID);
  res.send({ response: "called patientID" + req.body.patientID }).status(200);
});

app.post("/del", (req, res) => {
  // res
  //   .send({ response: "updated " + JSON.stringify(updateWaitingNumber()) })
  //   .status(200);
  removeFromQueue(req.body.placeID, req.body.patientID);
  req.app.io.emit("update", updateWaitingNumber(req.body.placeID));
  res.send({ response: "deleted patientID" + req.body.patientID }).status(200);
});

// ---------------------all api routes---------------------
// --------------------------------------------------------

// --------------------------------------------------------
// -------------------all socket cbs-----------------------
io.on("connection", (socket) => {
  console.log("New client connected");

  // send inital information
  socket.on("update", (placeID) => {
    socket.emit("update", updateWaitingNumber(placeID));
    socket.emit("timing", 10);
  });

  // end timer on disconnect
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});
// -------------------all socket cbs-----------------------
// --------------------------------------------------------

server.listen(port, () => console.log(`listening on http://127.0.0.1:` + port));
