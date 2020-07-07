const njwt = require("njwt");

const users = [
  {
    id: "1",
    praxisName: "ukerlangen",
    password: "123", // please note that it's NEVER a good idea to store passwords directly nor have passwords `password`
  },
  {
    id: "2",
    praxisName: "drcovid",
    password: "666",
  },
];

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

// This express middleware attaches `userId` to the `req` object if a user is
// authenticated. This middleware expects a JWT token to be stored in the
// `Access-Token` header.
const jwtAuthenticationMiddleware = (req, res, next) => {
  const token = req.header("Access-Token");
  if (!token) {
    return next();
  }

  try {
    const decoded = decodeToken(token);
    const { userId } = decoded;

    console.log("decoded", decoded);
    console.log("userId", userId);

    if (users.find((user) => user.id === userId)) {
      console.log("found user!");
      req.userId = userId;
    }
  } catch (e) {
    return next();
  }

  next();
};

// This middleware stops the request if a user is not authenticated.
async function isAuthenticatedMiddleware(req, res, next) {
  if (req.userId) {
    return next();
  }

  res.status(401);
  res.json({ error: "User not authenticated" });
}

// This endpoints generates and returns a JWT access token given authentication
// data.
async function jwtLogin(req, res) {
  const { name, password } = req.body;
  const user = users.find(
    (user) => user.praxisName === name && user.password === password
  );

  if (!user) {
    res.status(401);
    return res.json({ error: "Invalid name or password" });
  }

  const accessToken = encodeToken({ userId: user.id });
  return res.json({ accessToken });
}

module.exports = {
  users,
  encodeToken,
  decodeToken,
  jwtAuthenticationMiddleware,
  isAuthenticatedMiddleware,
  jwtLogin,
};
