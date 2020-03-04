const express = require("express");
const Chat = require("../Models/chat");

const route = express();

route.get("/chat/:idPatient", async (req, res) => {
  const { idPatient } = req.params;

  Chat.findById(idPatient, async (error, chat) => {
    if (error) {
      console.log(`Error request Chat Patient ${idPatient}. Error: ${error}`);

      res.json({
        error: true,
        title: "Error de Consulta",
        msg:
          "Hubo un error al intentar consultar este Chat, por favor informe de este error"
      });
    } else {
      let chatSliced = chat != null ? chat.slice(-50) : null;

      res.json({
        error: false,
        msg: chatSliced
      });
    }
  });
});

module.exports = route;
