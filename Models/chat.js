const { Schema, model } = require("mongoose");

const ChatSchema = new Schema({
  id_patient: String,
  chat: [
    {
      id_user: String,
      text: String
    }
  ]
});

module.exports = model("Chat", ChatSchema);
