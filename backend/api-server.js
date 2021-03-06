const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const Firestore = require("@google-cloud/firestore");

const njwt = require("njwt");
const bodyParser = require("body-parser");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const twillioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const APP_SECRET = process.env.APP_SECRET;
const telNmbr = process.env.TWILIO_NBR;

const client = require("twilio")(accountSid, twillioAuthToken);

const PRODUCTION = true;

let port;
if (PRODUCTION) {
  port = process.env.PORT;
} else {
  port = 8080;
}

const FrontEndUrl = "https://wartezimmer-a2415.web.app/";

////////////////////////////////////////////////////////////
/////////////////// database wrapper ///////////////////////
////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////

const fdb = new Firestore({
  projectId: "wartezimmer-a2415",
  keyFilename: "secrets/admin-key-wartezimmer.json",
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
let PASS = "password";

var db = {
  ukerlangen: {
    password: "$2a$10$RcDp3OIhEpqhirLYhH2xCeN3uHEJKfz1o.WThIiPtfR55k2o8S6Ra",
    details: {
      name: "Universitätsklinikum Erlangen",
      address: "Östliche Stadtmauerstraße 4, 91052 Erlangen",
      field: "Virologie",
      email: "uk@erlangen.com",
    },
    queue: [
      { id: "jj97", pos: 1, called: false },
      { id: "mr98", pos: 2, called: false },
    ],
    patientData: [
      {
        id: "mr98",
        first_name: "Max",
        surname: "Rohleder",
        appointment_date: new Date(),
        short_diagnosis: "Corona",
        mobile: "0123456789",
        email: "corona@covid19.de",
      },
      {
        id: "jj97",
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
    password: "$2a$10$sIk01uusweLdYAgEAO0xgudUSQKyEfZWo7AhSw959TiaT0B5yDxZm",
    details: {
      name: "Praxis Dr. Covidweg",
      address: "Fledermausweg 19, 12020 Wuhan",
      field: "Allgemeinarzt",
      email: "drcovid@china.com",
    },
    queue: [
      { id: "jj97", pos: 2, called: false },
      { id: "mr98", pos: 1, called: false },
    ],
    patientData: [
      {
        id: "mr98",
        first_name: "Max",
        surname: "Rohleder",
        appointment_date: new Date(),
        short_diagnosis: "Corona",
        mobile: "0123456789",
        email: "corona@covid19.de",
      },
      {
        id: "jj97",
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

const isValidPlace = async (placeID) => {
  if (PRODUCTION) {
    console.log("checking if place exists: ", placeID);
    let placeRef = PLACES.doc(placeID);
    try {
      const placePrev = await placeRef.get();
      console.log("[Firestore] answer from backend: ", placePrev);
      console.log(placeRef.exists);
      if (!placePrev.exists) {
        return false;
      } else {
        return true;
      }
    } catch (error) {
      console.log("[Firestore] isValidPlace: ", error);
    }
  } else {
    return db.hasOwnProperty(placeID);
  }
};

const getDetails = async (placeID) => {
  if (PRODUCTION) {
    console.log("FIREBASE: getDetails");
    let placeRef = PLACES.doc(placeID);
    try {
      const placeData = await placeRef.get();
      if (!placeData.exists) {
        console.log("document does not exit!");

        return { exists: false };
      } else {
        var details = placeData.get(DETAILS);
        console.log("async details", details);
        details = { exists: true, ...details };
        return details;
      }
    } catch (err) {
      console.log("Error getting document ", err);
    }
  }
  //console.log(db[placeID].details);
  return db[placeID].details;
};

const sendSMS = (toNumber, placeName, link, firstName) => {
  var text =
    "Hallo " +
    firstName +
    "!\n\nWir haben dich soeben in der Praxis " +
    placeName +
    " angemeldet!\n \nHier findest du den digitalen Warteraum: \n" +
    link +
    "\n \nKlicke auf den Link um den digitalen Warteraum zu betreten! \nBitte halte dich von anderen fern, um das Infektionsrisiko zu senken. \n \nDeine Praxis \n" +
    placeName;

  if (PRODUCTION) {
    console.log("send sms to: " + toNumber + " " + placeName + " " + link);
    client.messages
      .create({
        from: telNmbr,
        to: toNumber,
        body: text,
      })
      .then((message) => console.log(message.sid));
  } else {
    console.log("send sms to: " + toNumber + " " + placeName + " " + link);
    console.log(text);
  }
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
    return match.id;
  } else {
    db[placeID].patientData.push({
      id: patID,
      first_name: pd.first_name,
      surname: pd.surname,
      appointment_date: pd.appointment_date,
      short_diagnosis: pd.short_diagnosis,
      mobile: pd.mobile,
      email: pd.email,
    });
    return patID;
  }
};

const registerPraxis = async (placeID, details, password) => {
  if (PRODUCTION) {
    try {
      var success = await PLACES.doc(placeID).set({
        password: password,
        details: {
          name: details.praxisName,
          address:
            details.street +
            " " +
            details.houseNumber +
            ", " +
            details.zipCode +
            " " +
            details.place,
          field: details.field,
          email: details.email,
        },
      });
      console.log(
        "[Firestore] succesfully added new place with id: ",
        placeID,
        success
      );
    } catch (err) {
      console.log("[Firestore] registerPraxis", err, success);
    }
  } else {
    db[placeID] = {
      password: details.password,
      details: {
        name: details.praxisName,
        address:
          details.street +
          " " +
          details.houseNumber +
          ", " +
          details.zipCode +
          " " +
          details.place,
        field: details.field,
        email: details.email,
      },
      queue: [
        { id: "jj97", pos: 1 },
        { id: "mr98", pos: 2 },
      ],
      patientData: [
        {
          id: "mr98",
          first_name: "Max",
          surname: "Rohleder",
          appointment_date: new Date(),
          short_diagnosis: "Corona",
          mobile: "0123456789",
          email: "corona@covid19.de",
        },
        {
          id: "jj97",
          first_name: "Jule",
          surname: "Verne",
          appointment_date: new Date(),
          short_diagnosis: "Corona",
          mobile: "0123456789",
          email: "corona@covid19.de",
        },
      ],
    };
  }
};

const sendValidationMail = async (email) => {
  if (PRODUCTION) {
    //TODO V1 send Email with link to verify email
    return true;
  }
  return true;
};

const isValidPatient = async (placeID, patientID) => {
  if (PRODUCTION) {
    console.log("checking if id exists: ", patientID);
    const patRef = PLACES.doc(placeID).collection(PATIENTS).doc(patientID);
    try {
      const docPrev = await patRef.get();
      return docPrev.exists;
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
    //TODO update all pos
    console.log("FIREBASE: removeFromQueue");
    try {
      const res = await PLACES.doc(placeID)
        .collection(QUEUES)
        .doc(patientID)
        .delete();
      return res;
    } catch (err) {
      console.log(err);
    }
  }

  console.log("[deletePatient]: deleting " + patientID);
  var newQueue = db[placeID].queue.filter((entry) => {
    return entry.id !== patientID;
  });

  Object.keys(newQueue).forEach((key, index) => {
    //console.log(key, index, newQueue[key]);
    newQueue[key].pos = index + 1;
  });
  db[placeID].queue = newQueue;
};

const moveInQueue = async (placeID, index, direction) => {
  /**
   * retrieve entire queue of place with id @param placeID and swap position
   * of queue entry at @param index with the entry
   * above or below depending on @param direction
   *
   * ASSUMPTION: Front end checks that there are at least 2 patients in the queue
   *
   * then update positions of these two entries
   */
  if (PRODUCTION) {
    var startAt = direction === "up" ? index - 1 : index;
    var queueRef = PLACES.doc(placeID).collection(QUEUES);
    var twoEntriesRef = queueRef.orderBy("pos", "asc").limit(2).offset(startAt);
    try {
      // these query snapshots can only be read out with foreach ?!
      // https://stackoverflow.com/questions/49088708/return-document-collection-as-json-from-firestore
      const entriesDoc = await twoEntriesRef.get();
      var entries = [];
      for (const doc of entriesDoc.docs) {
        entries.push({ ...doc.data() });
      }
      console.log("entries to switch positions", entries);

      // switch the positions of the two consecutive queue entries
      var tmp = entries[0].pos;
      entries[0].pos = entries[1].pos;
      entries[1].pos = tmp;
      console.log("after switch", entries);

      // upload the new entries
      await queueRef.doc(entries[0].id).set(entries[0]);
      await queueRef.doc(entries[1].id).set(entries[1]);
    } catch (err) {
      console.log("Error moving patient in queue", err);
    }
  } else {
    var newQueue = db[placeID].queue;
    if (direction == "up") {
      console.log("MOVE UP");
      var pat = newQueue[index];
      newQueue[index] = newQueue[index - 1];
      newQueue[index - 1] = pat;
      newQueue[index].pos = newQueue[index].pos + 1;
      newQueue[index - 1].pos = newQueue[index - 1].pos - 1;
    } else {
      console.log("MOVE DOWN");
      var pat = newQueue[index];
      newQueue[index] = newQueue[index + 1];
      newQueue[index + 1] = pat;
      newQueue[index].pos = newQueue[index].pos - 1;
      newQueue[index + 1].pos = newQueue[index + 1].pos + 1;
    }
    console.log(newQueue);
    db[placeID].queue = newQueue;
  }
};

const setCalledQueue = async (placeID, patientID, isCalled) => {
  // change status of patID in queue of placeID to boolean isCalled

  if (PRODUCTION) {
    try {
      await PLACES.doc(placeID)
        .collection(QUEUES)
        .doc(patientID)
        .update({ called: isCalled });
    } catch (err) {
      console.log("Error setCalledQueue", err);
    }
  } else {
    var newQueue = db[placeID].queue;
    var pos = newQueue
      .map(function (e) {
        return e.id;
      })
      .indexOf(patientID);
    newQueue[pos].called = isCalled;
    db[placeID].queue = newQueue;
  }
};

const getQueue = async (praxisID) => {
  // return the entire queue with the first position starting at 1
  if (PRODUCTION) {
    console.log("[Firestore] getQueue:");
    var queueRef = PLACES.doc(praxisID)
      .collection(QUEUES)
      .orderBy("pos", "asc");
    try {
      const queueDoc = await queueRef.get();
      var relativePositions = [];
      var i = 1;
      for (const doc of queueDoc.docs) {
        var rel = doc.data();
        rel.pos = i;
        relativePositions.push(rel);
        i = i + 1;
      }
      console.log("relative positions:", relativePositions);
      return relativePositions;
    } catch (err) {
      console.log("error retrieving queue: ", praxisID);
      console.log(err);
    }
  } else {
    try {
      return db[praxisID].queue;
    } catch (err) {
      console.log("error retrieving queue: ", praxisID);
    }
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
      await queueRef
        .doc(patientID)
        .set({ pos: maxPos + 1, id: patientID, called: false });
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
  db[placeID].queue.push({ id: patientID, pos: lastPosition, called: false });
  console.log(db[placeID].queue);
  return lastPosition;
};

// PROTECTED
var getQueueWithInfo = async (placeID) => {
  // returning the queue enriched with patient info
  var queueData = [];
  if (PRODUCTION) {
    console.log("[FIRESTORE] getQueueWithInfo for", placeID);
    try {
      var idAndPos = await getQueue(placeID);
      if (idAndPos.length > 0) {
        for (let i = 0; i < idAndPos.length; i++) {
          var patInfo = await getPatientInfo(placeID, idAndPos[i].id);
          queueData.push({
            ...idAndPos[i],
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
        return x.id == entry.id;
      });
      queueData.push({ pos: entry.pos, ...patInfo });
    }
    console.log(queueData);
    return queueData;
  }
};

const verifyPassword = async (placeID, password) => {
  if (PRODUCTION) {
    console.log("FIRESORE: verifyPassword");
    const passRef = PLACES.doc(placeID);

    try {
      var passDoc = await passRef.get();
      if (passDoc.password == password) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.log("[Firestore] verfiyPassword: ", err);
      return false;
    }
  }

  //console.log(db[placeID]["password"] + " ? " + password);
  return (
    isValidPlace(placeID) &&
    bcrypt.compareSync(password, db[placeID]["password"])
  );
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
  res.send("This is the Digitales Wartezimmer Backend").status(200);
});

// can be removed as details are public
app.post("/admin/details", async (req, res) => {
  console.log("admin place details requested");
  var placeID = isAuthenticationMiddleware(req, res);
  if (placeID == null) {
    res.send({ authConfirmed: false }).status(200);
  } else {
    var details = await getDetails(placeID);
    res.send({ authConfirmed: true, details: details }).status(200);
  }
});

app.get("/details/:placeID", async (req, res) => {
  console.log("place details requested");
  var details = await getDetails(req.params.placeID);
  res.send(details).status(200);
});

app.post("/admin/queue", async (req, res) => {
  console.log("admin queue requested");
  var placeID = isAuthenticationMiddleware(req, res);
  if (placeID == null) {
    res.send({ authConfirmed: false, queueData: null }).status(200);
  } else {
    var queueData = await getQueueWithInfo(placeID);
    res.send({ authConfirmed: true, queueData: queueData }).status(200);
  }
});

app.post("/auth", (req, res) => {
  console.log("authentication requested");
  var placeID = req.body.praxisID;
  var password = req.body.password;

  var placeExists = isValidPlace(placeID);
  var passwordConfirmed = false;
  if (placeExists) {
    passwordConfirmed = verifyPassword(placeID, password);
  }
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

app.post("/auth-email", async (req, res) => {
  var isNewMail = await sendValidationMail(req.body.email);
  console.log("is new mail");
  res.send({ isNewMail: isNewMail }).status(200);
});

app.post("/registerPraxis", async (req, res) => {
  console.log("registerPraxis requested");
  var validNewName = isValidPlace(req.body.placeID); //check if placeID unique
  //console.log(newPlaceID);
  if (validNewName) {
    //anlegen
    await registerPraxis(
      req.body.placeID,
      {
        praxisName: req.body.praxisName,
        place: req.body.place,
        field: req.body.field,
        zipCode: req.body.zipCode,
        street: req.body.street,
        houseNumber: req.body.houseNumber,
        phoneNumber: req.body.phoneNumber,
        email: req.body.email,
      },
      req.body.password
    );
    console.log("Praxis " + req.body.placeID + " added!");
    var accessToken = encodeToken({ userId: req.body.placeID });
    res
      .send({ newPlaceID: validNewName, accessToken: accessToken })
      .status(200);
  } else {
    res.send({ newPlaceID: validNewName, accessToken: null }).status(200);
  }
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

    var link = FrontEndUrl + "place/" + placeID + "/id/" + patientID;
    var placeDetail = await getDetails(placeID);
    //console.log(placeDetail);

    sendSMS(req.body.mobile, placeDetail.name, link, req.body.first_name);

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

app.post("/call", async (req, res) => {
  var called = req.body.isCalled ? "called" : "uncalled";
  var type = req.body.isCalled ? true : false;
  console.log(called + " " + req.body.id + " in: " + req.body.placeID);
  await setCalledQueue(req.body.placeID, req.body.id, type);
  req.app.io.emit("call", req.body.id);
  res.send({ response: "called patientID" + req.body.id }).status(200);
});

app.post("/move", async (req, res) => {
  //console.log("move " + req.body.direction);
  await moveInQueue(req.body.placeID, req.body.index, req.body.direction);
  var queueData = await getQueue(req.body.placeID);
  req.app.io.emit("update", queueData);
  res.send({ response: "moved patientID" }).status(200);
});

app.post("/del", async (req, res) => {
  try {
    await removeFromQueue(req.body.placeID, req.body.id);

    // sending entire queue now with relative positions
    var queueData = await getQueue(req.body.placeID);
    req.app.io.emit("update", queueData);

    res.send({ response: "deleted patientID" + req.body.id }).status(200);
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

  // send entire queue. frontend will qick the right position
  var queueData = await getQueue(patDaten[0]);
  try {
    socket.emit("update", queueData);
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

if (PRODUCTION) {
  server.listen(port, "0.0.0.0", () =>
    console.log(`listening on http://0.0.0.0:` + port)
  );
} else {
  server.listen(port, () =>
    console.log(`listening on http://127.0.0.1:` + port)
  );
}
