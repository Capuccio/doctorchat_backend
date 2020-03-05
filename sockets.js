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

      Chat.findOne({ id_patient: idPatient }, async (error, verifyChat) => {
        if (error) {
          console.log(
            `Error update Chat Patient ${idPatient}. Error: ${error}`
          );
        }

        if (verifyChat === null) {
          Chat.create(
            {
              id_patient: idPatient,
              chat: [
                {
                  id_user,
                  text
                }
              ]
            },
            function(error, saved) {
              if (error) {
                console.log("Error save chat: ", error);
              }

              socket.to(idPatient).emit("received", {
                id_user,
                text
              });
            }
          );
        } else {
          verifyChat.chat.push({
            id_user,
            text
          });

          socket.to(idPatient).emit("received", {
            id_user,
            text
          });

          verifyChat.save();
        }
      });
    });

    socket.on("disconnect", reason => {
      console.log(`Socket ID ${socket.id} disconnected, reason: ${reason} `);
    });
  });
};
