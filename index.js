const express = require("express");
const app = express();
const mongoose = require("mongoose");
const http = require("http").Server(app);
const io = require("socket.io")(http);
require("./sockets")(io);

app.use(express.json({ extended: true }));
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
const MONGO_URI = "mongodb://localhost/doctorchat";
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(connected => console.log("MongoDB database connected"))
  .catch(error =>
    console.log(`Couldn't connect to MongoDB database: ${error}`)
  );

app.set("port", process.env.PORT || 5000);

// Routes
app.use(require("./Routes/users"));
app.use(require("./Routes/chat"));

http.listen(app.get("port"), () => {
  console.log(`Server up in port ${app.get("port")}`);
});
