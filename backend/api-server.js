// inspired by https://www.valentinog.com/blog/socket-react/

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const Firestore = require("@google-cloud/firestore");

const njwt = require("njwt");
const bodyParser = require("body-parser");

const port = 8000;

////////////////////////////////////////////////////////////
/////////////////// database wrapper ///////////////////////
////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////

const production = false;

const fdb = new Firestore({
  projectId: "wartezimmer-a2415",
  keyFilename: "backend-db-access-key.json",
});

// firestore convention: large collections with small documents
let DETAILS = fdb.collection("places");
let PATIENTS = fdb.collection("patients"); // collection of collections
let QUEUES = fdb.collection("queues"); // collection of collections
let PASS = fdb.collection("passwords");

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
        patientID: "jj97",
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
    queue: [
      { id: "jj97", pos: 2 },
      { id: "mr98", pos: 1 },
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
        patientID: "jj97",
        first_name: "Jule",
        surname: "Verne",
        appointment_date: new Date(),
        short_diagnosis: "Corona",
        mobile: "0123456789",
        email: "corona@covid19.de",
      },
    ],
  },
};

const getDetails = (placeID) => {
  if (production) {
    let detailsRef = DETAILS.doc(placeID);
    let getPlace = detailsRef
      .get()
      .then((doc) => {
        if (!doc.exists) {
          return null;
        } else {
          return doc.data();
        }
      })
      .catch((err) => {
        console.log("Error getting document ", err);
      });
  }
  return db[placeID].details;
};

const registerPatient = (placeID, pd) => {
  var patId = createUID(placeID, pd.first_name, pd.surname);

  // use firestore insert a new entry if not existand and return unique patID
  if (production) {
    var patID;
    var patientRef = PATIENTS.collection(placeID);
    patientRef = patientRef.where("first_name", "==", pd.first_name);
    patientRef = patientRef.where("surname", "==", pd.surname);
    patientRef = patientRef.where(
      "appointment_date",
      "==",
      pd.appointment_date
    );
    patientRef = patientRef.where("short_diagnosis", "==", pd.short_diagnosis);
    patientRef = patientRef.where("mobile", "==", pd.mobile);
    patientRef = patientRef.where("email", "==", pd.email);
    patientRef
      .get()
      .then((doc) => {
        if (!doc.exists) {
          patId = createUID(placeID, pd.first_name, pd.surname);
          PATIENTS.collection(placeID).doc(patID).set(pd);
        } else {
          patID = doc.data().patID;
        }
      })
      .catch((err) => {
        console.log("Error getting document", err);
      });

    return patId;
  }

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
  if(production){

    const res = await QUEUES.collection(placeID).doc(patientID).delete();
    return res;
  }


  console.log("[deletePatient]: deleting " + patientID);
  var newQueue = db[placeID].queue.filter((entry) => {
    return entry.id !== patientID;
  });
  db[placeID].queue = newQueue;
};

const updateWaitingNumber = (praxisID, patientID) => {
  if (production){
    var queueRef = QUEUES.collection(praxisID);

    var patRef = queueRef.doc(patientID);
    var check = patRef.get().then((doc) => {
      return doc.data().pos;
    }).catch(
      console.log("error retrieving patId from queue: ", patientID, praxisID)
    )
  }

  var lst = db[praxisID].queue;
  var entry = lst.find((x) => {
    return x.id == patientID;
  });
  if (typeof entry === "undefined") {
    // the patientID is not registered (anymore)//TODO
    return null;
  } else {
    //console.log(entry.pos);
    return entry.pos;
  }
};

const createUID = (placeID, first, sur) => {
  // create an place-unique patientID from first and surname
  var id = first.substring(0, 2) + sur.substring(0, 2);

  if(production){
    var exists = true;
    while(true){
      var idRef = QUEUES.collection(placeID).doc(id);
      var docCheck = idRef.get()
        .then((doc) => {
          exists = doc.exists;
        })
        .catch((err) => {
          console.log("Error getting document in createUID ", err);
        });
      if(!exists){
        break;
      }
      id += "I";
    }
    return id;

  }


  while (db[placeID].queue.some((entry) => entry.id === id)) {
    id += "I";
  }
  return id;
};

const queuePatient = (placeID, patientID) => {

  if(production){
    var maxPos = 0;
    var queueRef = QUEUES.collection(placeID);
    queueRef.orderBy("pos").limit(1).get().then(querySnapshot => {
      querySnapshot.forEach(documentSnapshot => {
        maxPos = documentSnapshot.data().pos;
      }).catch((err) => {
        console.log("Error queuing patient ", err);
      });
    });

    queueRef.doc(patientID).set(maxPos + 1);
    return maxPos + 1;
  }

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

// -------------------------------------------------------------------JWT--------------------------------------
//JWT

app.use(bodyParser.json());
const {
  APP_SECRET = "something really random 2000",
  APP_BASE_URL = "http://localhost:3000",
} = process.env;

function encodeToken(tokenData) {
  return njwt.create(tokenData, APP_SECRET).compact();
}

function decodeToken(token) {
  return njwt.verify(token, APP_SECRET).body;
}

const isAuthenticationMiddleware = (req, res, next) => {
  var placeID = req.body.placeID;
  var token = req.body.token;
  try {
    const decoded = decodeToken(token);
    const { userId } = decoded;

    //console.log("decoded", decoded);
    //console.log("userId", userId);

    if (placeID === userId) {
      console.log("Token and PlaceID match!");
      //req.userId = userId;
      return userId;
    } else {
      console.log("Token and PlaceID DO NOT match!");
      console.log("Try to log in properly");
      return null;
    }
  } catch (e) {
    console.log(e);
    return null;
  }
};

//JWT
// -------------------------------------------------------------------JWT--------------------------------------

// making sockets available in rest api
app.io = io;

// --------------------------------------------------------
// ---------------------all api routes---------------------
app.get("/", (req, res) => {
  res
    .send({ response: "This is the Digitales Wartezimmer Backend" })
    .status(200);
});

app.post("/admin_details/", (req, res) => {
  var placeID = isAuthenticationMiddleware(req, res);
  if (placeID == null) {
    res.send({ authConfirmed: false }).status(200);
  } else {
    var details = getDetails(placeID);
    res.send({ authConfirmed: false, details: details }).status(200);
  }
});

app.get("/details/:placeID", (req, res) => {
  console.log("place details requested");
  res.send(getDetails(req.params.placeID)).status(200);
});

app.post("/admin_queue/", (req, res) => {
  var placeID = isAuthenticationMiddleware(req, res);
  if (placeID == null) {
    res.send({ authConfirmed: false, queueData: null }).status(200);
  } else {
    var queueData = [];
    for (let i = 0; i < db[placeID].queue.length; i++) {
      var entry = db[placeID].queue[i];
      var patInfo = db[placeID].patientData.find((x) => {
        return x.patientID == entry.id;
      });
      queueData.push({ pos: entry.pos, ...patInfo });
    }
    res.send({ authConfirmed: true, queueData: queueData }).status(200);
  }
});

app.post("/auth/admin/", (req, res) => {
  var placeID = req.body.praxisID;
  var password = req.body.password;
  //console.log(placeID + password);

  var placeExists = db.hasOwnProperty(placeID);
  var existsAndConfirmed = placeExists && db[placeID].password == password;

  var accessToken = null;
  if (existsAndConfirmed) {
    var accessToken = encodeToken({ userId: placeID });
  }
  res
    .send({ praxisConfirmed: existsAndConfirmed, accessToken: accessToken })
    .status(200);
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
  var placeID = isAuthenticationMiddleware(req, res);
  if (placeID == null) {
    res.send({ authConfirmed: false }).status(200);
  } else {
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
  }
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
  var patDaten = socket.handshake.query.patDaten;
  patDaten = patDaten.split(" x+x "); //allow " " in prakisID

  console.log(patDaten[0] + " : " + patDaten[1]);

  socket.emit("update", updateWaitingNumber(patDaten[0], patDaten[1]));
  socket.emit("timing", 10);

  // end timer on disconnect
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});
// -------------------all socket cbs-----------------------
// --------------------------------------------------------

server.listen(port, () => console.log(`listening on http://127.0.0.1:` + port));
