module.exports = function(io) {
  const Users = require("./Models/users");
  const Chat = require("./Models/chat");

  io.on("connection", socket => {
    console.log("conectado: ", socket.id);

    socket.on("joinRoom", idRoom => {
      console.log("Joining room ", idRoom);
      socket.join(idRoom);
    });

    socket.on("newMessage", msg => {
      const { id_user, text, idPatient } = msg;

      socket.to(idPatient).emit("received", {
        id_user,
        text
      });

      // socket.emit("messageReceived", {
      //   id_user,
      //   text
      // });

      // Chat.findOne({ id_patient: idPatient }, async (error, verifyChat) => {
      //   if (error) {
      //     console.log(
      //       `Error update Chat Patient ${idPatient}. Error: ${error}`
      //     );

      //     socket.emit("answerChat", {
      //       error: true,
      //       title: "Error de Consulta",
      //       msg:
      //         "Hubo un error al intentar actualizar el Chat, por favor informe de este error"
      //     });
      //   }

      //   if (verifyChat === null) {
      //     Chat.create(
      //       {
      //         id_patient: idPatient,
      //         chat: [
      //           {
      //             id_user,
      //             text
      //           }
      //         ]
      //       },
      //       function(error, saved) {
      //         if (error) {
      //           console.log("Error save chat: ", error);
      //         }

      //         console.log("Enviando mensaje");
      //         socket.to(idPatient).emit("messageReceived", {
      //           id_user,
      //           text
      //         });
      //       }
      //     );
      //   }
      // });
    });

    socket.on("disconnect", reason => {
      console.log(`Socket ID ${socket.id} disconnected, reason: ${reason} `);
    });
  });
};
