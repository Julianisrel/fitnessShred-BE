const express = require("express");
const helmet = require("helmet")
const cors = require("cors")

const authOrouter = require("./routes/authO");

const server = express();
server.use(express.json());

server.use(helmet())
server.use(cors())

const { auth } = require('express-openid-connect');

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: 'a long, randomly-generated string stored in env',
  baseURL: 'http://localhost:8000',
  clientID: 'Rcf5cZp12ELcrY1bPMdGWeHVf1sDZAjV',
  issuerBaseURL: 'https://dev-atew1exi.us.auth0.com'
};


// auth router attaches /login, /logout, and /callback routes to the baseURL
server.use(auth(config));

// req.isAuthenticated is provided from the auth router
server.get('/', (req, res) => {
  res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
});

server.use("/api",authOrouter);

server.get("/", (req, res) => {
    res.status(200).json({message: "server running"})
})

module.exports = server
