const express = require("express");
const app = express();
const mongoose = require("mongoose");
const http = require("http").Server(app);
const io = require("socket.io")(http);
const { Expo } = require("expo-server-sdk");
require("./sockets")(io, Expo);
require("dotenv").config();

app.use(express.json({ limit: "1000mb", extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// MongoDB
mongoose
  .connect(process.env.MONGO_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(connected => console.log("MongoDB database connected"))
  .catch(error =>
    console.log(`Couldn't connect to MongoDB database: ${error}`)
  );

// Routes
app.use(require("./Routes/users"));
app.use(require("./Routes/chat"));

http.listen(process.env.PORT, () => {
  console.log(`Server up in port ${process.env.PORT}`);
});
