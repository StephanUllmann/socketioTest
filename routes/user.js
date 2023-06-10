const express = require("express");
const app = express.Router();

const { loginUser, signupUser } = require("../controllers/user");

app.post("/login", loginUser);
app.post("/signup", signupUser);

module.exports = app;
