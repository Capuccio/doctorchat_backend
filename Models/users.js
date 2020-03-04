const { Schema, model } = require("mongoose");

const UserSchema = new Schema({
  name: String,
  lastname: String,
  email: String,
  password: String,
  birthday: String,
  genre: String,
  tokenNotifications: String,
  profilePicture: String,
  deleteHashPicture: String,
  level: Number,
  doctor: String
});

module.exports = model("User", UserSchema);
