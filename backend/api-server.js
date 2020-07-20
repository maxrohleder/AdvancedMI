// inspired by https://www.valentinog.com/blog/socket-react/

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const Firestore = require("@google-cloud/firestore");

const njwt = require("njwt");
const bodyParser = require("body-parser");
const { verify } = require("crypto");
const e = require("express");

const accountSid = "AC70f7f2bccb0bd528df589f5b305f50aa";
const twillioAuthToken = "a42e38aa8ce7852ac972722532660f17";
const telNmbr = "+15128835631";
const client = require("twilio")(accountSid, twillioAuthToken);

const port = 8000;

////////////////////////////////////////////////////////////
/////////////////// database wrapper ///////////////////////
////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////

const PRODUCTION = true;

const fdb = new Firestore({
  projectId: "wartezimmer-a2415",
  keyFilename: "../../gcloud/admin-key-wartezimmer.json",
});

// firestore convention: large collections with small documents
let PLACES = fdb.collection("places"); // PATIENTS.doc(placeID).doc(patID).collection
/*
 * patients:
  PLACES.doc(placeID).doc(patID).collection
  QUEUES.doc(placeID).collection("queue").doc(patID)
 */
let DETAILS = "details";
let PATIENTS = "patients";
let QUEUES = "queue";
let PASS = "passwords";

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

const isValidPlace = (placeID) => {
  if (PRODUCTION) {
    const placeRef = PLACES.doc(placeID);
    placeRef
      .get()
      .then((docPreview) => {
        if (docPreview.exists) {
          return true;
        } else {
          return false;
        }
      })
      .catch((err) => {
        console.log("firestore error on isValidPlace", err);
      });
  }
  return db.hasOwnProperty(placeID);
};

const getDetails = async (placeID) => {
  if (PRODUCTION) {
    console.log("FIREBASE: getDetails");
    let placeRef = PLACES.doc(placeID);
    try {
      const placeData = await placeRef.get();
      if (!placeData.exists) {
        console.log("document does not exit!");
        return null;
      } else {
        var details = placeData.get(DETAILS);
        console.log("async details", details);
        return details;
      }
    } catch (err) {
      console.log("Error getting document ", err);
    }
  }

  return db[placeID].details;
};
const sendSMS = (toNumber, praxis, link, waitPos) => {
  console.log(
    "send sms to: " + toNumber + " " + praxis + " " + link + " " + waitPos
  );
  client.messages
    .create({
      from: telNmbr,
      to: toNumber,
      body:
        "Hallo! \n Wir haben dich soeben in der Praxis " +
        praxis +
        " angemeldet!\n \n Hier findest du den digitalen Warteraum: \n" +
        link +
        "\n Deine Wartenummer ist: " +
        waitPos +
        "\n \n Wenn du bereit bist in die Praxis zu kommen, klicke auf Beitreten! \n Bitte halte dich von anderen fern, um das Infektionsrisiko zu senken \n \n  Deine Praxis \n " +
        praxis,
    })
    .then((messsage) => console.log(message.sid));
};

const registerPatient = async (placeID, pd) => {
  var patID = await createUID(placeID, pd.first_name, pd.surname);
  console.log("---------------- ID", patID);

  // use firestore insert a new entry if not existand and return unique patID
  if (PRODUCTION) {
    console.log("FIREBASE: registerPatient");
    var patientRef = PLACES.doc(placeID).collection(PATIENTS);
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

    try {
      const patientData = await patientRef.get();
      if (!patientData.exists) {
        await PLACES.doc(placeID).collection(PATIENTS).doc(patID).set(pd);
      } else {
        console.log("I KNOW THIS PATIENT:", patID);
        patID = doc.data().patID;
      }
    } catch (err) {
      console.log("Error getting document", err);
    }

    return patID;
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

const isValidPatient = async (placeID, patientID) => {
  if (PRODUCTION) {
    console.log("checking if id exists: ", patientID);
    const patRef = PLACES.doc(placeID).collection(PATIENTS).doc(patientID);
    try {
      const docPrev = await patRef.get();
      return docPreview.exists;
    } catch (err) {
      console.log("firestore error on isValidPlace", err);
    }
  }
  var placeExists = isValidPlace(patientID);
  entry = db[placeID].queue.find((x) => x.id == patientID);
  return placeExists && typeof entry !== "undefined";
};

const getPatientInfo = async (placeID, patientID) => {
  if (PRODUCTION) {
    console.log("FIRESTORE getPatient: ", patientID);
    const patRef = PLACES.doc(placeID).collection(PATIENTS).doc(patientID);
    try {
      const patDoc = await patRef.get();
      if (patDoc.exists) {
        console.log("patient exists");
        return patDoc.data();
      } else {
        console.log("patient doesnt exist");
        return null;
      }
    } catch (err) {
      console.log("firestore error on isValidPlace", err);
    }
  }
};

const removeFromQueue = async (placeID, patientID) => {
  if (PRODUCTION) {
    console.log("FIREBASE: removeFromQueue");
    try {
      const res = await PLACES.doc(placeID)
        .collection(QUEUES)
        .doc(patientID)
        .delete();
      return res;
    } catch (error) {
      console.log(err);
    }
  }

  console.log("[deletePatient]: deleting " + patientID);
  var newQueue = db[placeID].queue.filter((entry) => {
    return entry.id !== patientID;
  });
  db[placeID].queue = newQueue;
};

const updateWaitingNumber = async (praxisID, patientID) => {
  if (PRODUCTION) {
    console.log("FIREBASE: updateWaitingNumber", patientID);

    var patRef = PLACES.doc(praxisID).collection(QUEUES).doc(patientID);
    try {
      const patDoc = await patRef.get();
      if (patDoc.exists) {
        return patDoc.data().pos;
      } else {
        return null;
      }
    } catch (err) {
      console.log("error retrieving patId from queue: ", patientID, praxisID);
    }
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

const createUID = async (placeID, first, sur) => {
  // create an place-unique patientID from first and surname
  var id = first.substring(0, 2) + sur.substring(0, 2);

  if (PRODUCTION) {
    console.log("FIREBASE: createUID", id);

    while (true) {
      var idRef = PLACES.doc(placeID).collection(PATIENTS).doc(id);
      var res = await idRef.get();
      if (!res.exists) {
        break;
      }
      console.log("exists: ", id);
      id += "I";
    }
    return id;
  }

  while (db[placeID].queue.some((entry) => entry.id === id)) {
    id += "I";
  }
  return id;
};

const queuePatient = async (placeID, patientID) => {
  if (PRODUCTION) {
    console.log("FIREBASE: queuePatient");

    var maxPos = -1;
    var queueRef = PLACES.doc(placeID).collection(QUEUES);
    try {
      const queueDoc = await queueRef.orderBy("pos", "desc").limit(1).get();
      for (const doc of queueDoc.docs) {
        maxPos = doc.data().pos;
      }
      console.log("maxpos: ", maxPos);
      await queueRef.doc(patientID).set({ pos: maxPos + 1, id: patientID });
    } catch (err) {
      console.log("Error queuing patient ", err);
    }

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

var getQueue = async (placeID) => {
  var queueData = [];
  if (PRODUCTION) {
    console.log("FIRESTORE getQueue for", placeID);
    var queueRef = PLACES.doc(placeID).collection(QUEUES);
    var idAndPos = [];
    try {
      const snapshot = await queueRef.get();
      if (snapshot.docs.length > 0) {
        idAndPos = snapshot.docs.map((doc) => doc.data());
        for (let i = 0; i < idAndPos.length; i++) {
          var patInfo = await getPatientInfo(placeID, idAndPos[i].id);
          queueData.push({
            pos: idAndPos[i].pos,
            patientID: idAndPos[i].id,
            ...patInfo,
          });
        }
        return queueData;
      } else {
        console.log("queue empty");
        return [];
      }
    } catch (err) {
      console.log("FIRESTORE ERROR getQueue: ", err);
    }
  } else {
    for (let i = 0; i < db[placeID].queue.length; i++) {
      var entry = db[placeID].queue[i];
      var patInfo = db[placeID].patientData.find((x) => {
        return x.patientID == entry.id;
      });
      queueData.push({ pos: entry.pos, ...patInfo });
    }
    return queueData;
  }
};

const verifyPassword = (placeID, password) => {
  if (PRODUCTION) {
    console.log("FIRESORE: verifyPassword");
    const passRef = PLACES.doc(placeID);
    passRef
      .get()
      .then((docPreview) => {
        if (docPreview.exists) {
          if (docPreview.get(PASS) == password) {
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      })
      .catch((err) => {
        console.log("firestore error on isValidPlace", err);
      });
  }
  return isValidPlace(placeID) && db[placeID]["password"] == password;
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
app.io = io;
app.use(bodyParser.json());

//++++++++++++++++++++++++++++++++++++++++++++
//+++++++++++++++++ JWT ++++++++++++++++++++++
//++++++++++++++++++++++++++++++++++++++++++++

const {
  APP_SECRET = "something really random 2000",
  APP_BASE_URL = "http://localhost:3000",
} = process.env;

function encodeToken(tokenData) {
  var token = njwt.create(tokenData, APP_SECRET);
  token.body.exp = 9999999999;
  //console.log(token);
  return token.compact();
}

function decodeToken(token) {
  //console.log(njwt.verify(token, APP_SECRET).body);
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
      //console.log("Token and PlaceID match!");
      //req.userId = userId;
      return userId;
    } else {
      console.log("Token and PlaceID DO NOT match! Try to log in properly");
      return null;
    }
  } catch (e) {
    console.log(e);
    return null;
  }
};

//++++++++++++++++++++++++++++++++++++++++++++
//+++++++++++++++++ JWT ++++++++++++++++++++++
//++++++++++++++++++++++++++++++++++++++++++++

// --------------------------------------------------------
// ---------------------all api routes---------------------
app.get("/", (req, res) => {
  res
    .send({ response: "This is the Digitales Wartezimmer Backend" })
    .status(200);
});

// can be removed as details are public
app.post("/admin/details", async (req, res) => {
  var placeID = isAuthenticationMiddleware(req, res);
  if (placeID == null) {
    res.send({ authConfirmed: false }).status(200);
  } else {
    var details = await getDetails(placeID);
    res.send({ authConfirmed: true, details: details }).status(200);
  }
});

app.get("/details/:placeID", (req, res) => {
  console.log("place details requested");
  res.send(getDetails(req.params.placeID)).status(200);
});

app.post("/admin/queue", async (req, res) => {
  var placeID = isAuthenticationMiddleware(req, res);
  if (placeID == null) {
    res.send({ authConfirmed: false, queueData: null }).status(200);
  } else {
    var queueData = await getQueue(placeID);
    console.log("returned queue:", queueData);
    res.send({ authConfirmed: true, queueData: queueData }).status(200);
  }
});

// why /auth/admin not just /auth ?
app.post("/auth/admin/", (req, res) => {
  var placeID = req.body.praxisID;
  var password = req.body.password;

  var placeExists = isValidPlace(placeID);
  var passwordConfirmed = verifyPassword(placeID, password);

  var accessToken = null;
  if (placeExists && passwordConfirmed) {
    var accessToken = encodeToken({ userId: placeID });
  }
  res
    .send({
      praxisConfirmed: placeExists && passwordConfirmed,
      accessToken: accessToken,
    })
    .status(200);
});

app.get("/exists/user/:placeID/:patID", (req, res) => {
  var placeID = req.params.placeID;
  var patientID = req.params.patID;

  // check if place and user exist
  var patExists = isValidPatient(placeID, patientID);
  var placeExists = isValidPlace(placeID);
  res
    .send({
      praxisConfirmed: placeExists,
      userConfirmed: patExists,
    })
    .status(200);
});

// register a new patient and return its patientID and position
app.post("/admin/registerpatient", async (req, res) => {
  var placeID = isAuthenticationMiddleware(req, res);
  if (placeID == null) {
    res.send({ authConfirmed: false }).status(200);
  } else {
    // register patient details if not existant and return a unique id
    var placeID = req.body.placeID;
    var patientID = await registerPatient(placeID, {
      first_name: req.body.first_name,
      surname: req.body.surname,
      appointment_date: req.body.appointment_date,
      short_diagnosis: req.body.short_diagnosis,
      mobile: req.body.mobile,
      email: req.body.email,
    });

    // place patient into queue
    var pos = await queuePatient(placeID, patientID);

    var link = "http://localhost:3000/ort/" + placeID + "/id/" + patientID;
    sendSMS(req.body.mobile, placeID, link, pos);

    // inform admin interface about patientID and position
    res
      .send({
        authConfirmed: true,
        response: "registered patient",
        id: patientID,
        pos: pos,
      })
      .status(200);
  }
});

app.post("/call", (req, res) => {
  var channel = req.body.isCalled ? "called" : "uncalled";
  req.app.io.emit(channel, req.body.patientID);
  console.log(channel + " " + req.body.patientID);
  res.send({ response: "called patientID" + req.body.patientID }).status(200);
});

app.post("/del", async (req, res) => {
  // res
  //   .send({ response: "updated " + JSON.stringify(updateWaitingNumber()) })
  //   .status(200);
  try {
    await removeFromQueue(req.body.placeID, req.body.patientID);
    const pos = await updateWaitingNumber(req.body.placeID, req.body.patientID);
    req.app.io.emit("update", pos);
    res
      .send({ response: "deleted patientID" + req.body.patientID })
      .status(200);
  } catch (err) {
    console.log(err);
  }
});

// ---------------------all api routes---------------------
// --------------------------------------------------------

// --------------------------------------------------------
// -------------------all socket cbs-----------------------
io.on("connection", async (socket) => {
  console.log("New client connected");

  // send inital information
  var patDaten = socket.handshake.query.patDaten;
  patDaten = patDaten.split(" x+x "); //allow " " in prakisID

  console.log(patDaten[0] + " : " + patDaten[1]);

  try {
    socket.emit("update", await updateWaitingNumber(patDaten[0], patDaten[1]));
  } catch (err) {
    console.log(err);
  }

  socket.emit("timing", 10);

  // end timer on disconnect
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});
// -------------------all socket cbs-----------------------
// --------------------------------------------------------

server.listen(port, () => console.log(`listening on http://127.0.0.1:` + port));

// code schnibsel

/*
var getQueue = (placeID) => {
  var queueData = [];
  if (PRODUCTION) {
    console.log("FIRESTORE getQueue for", placeID);
    var queueRef = PLACES.doc(placeID).collection(QUEUES);
    var idAndPos = [];
    queueRef
      .get()
      .then((queueSnap) => {
        if (queueSnap.docs.length > 0) {
          queueRef.onSnapshot((snapshot) => {
            idAndPos = snapshot.docs.map((doc) => doc.data());
            console.log("list from snapshot", idAndPos);
          });
        } else {
          console.log("no queue yet. return empty");
          idAndPos = [];
        }
        console.log("idandpos:", idAndPos);
        for (let i = 0; i < idAndPos.length; i++) {
          var patInfo = getPatientInfo(placeID, idAndPos[i].id);
          queueData.push({ pos: idAndPos[i].pos, ...patInfo });
        }
        console.log("queuedata:", queueData);
        return queueData;
      })
      .catch((err) => {
        console.log("FIRESTORE ERROR getQueue: ", err);
      });
  } else {
    for (let i = 0; i < db[placeID].queue.length; i++) {
      var entry = db[placeID].queue[i];
      var patInfo = db[placeID].patientData.find((x) => {
        return x.patientID == entry.id;
      });
      queueData.push({ pos: entry.pos, ...patInfo });
    }
    return queueData;
  }
};
*/
