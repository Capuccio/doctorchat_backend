module.exports = function(io, Expo) {
  const Users = require("./Models/users");
  const Chat = require("./Models/chat");
  let expo = new Expo();

  io.on("connection", socket => {
    console.log("conectado: ", socket.id);

    socket.on("joinRoom", idRoom => {
      console.log("Joining room ", idRoom);
      socket.join(idRoom);
    });

    socket.on("newMessage", async msg => {
      const { id_user, text, idPatient, otherPerson } = msg;

      Chat.findOne({ id_patient: idPatient }, async (error, verifyChat) => {
        if (error) {
          console.log(
            `Error update Chat Patient ${idPatient}. Error: ${error}`
          );
        }

        Users.findById(
          otherPerson,
          "tokenNotifications",
          async (error, token) => {
            if (error) {
              console.log("Error take Notifications: ", error);
            }

            let messages = [];

            if (Expo.isExpoPushToken(token.tokenNotifications)) {
              messages.push({
                to: token.tokenNotifications,
                sound: "default",
                body: "Has recibido un nuevo mensaje"
              });

              let send = await expo.sendPushNotificationsAsync(messages);

              console.log(send);
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
          }
        );
      });
    });

    socket.on("blockPatient", idPatient => {
      Users.findById(idPatient, { status: 0 }, (error, updated) => {
        if (error) {
          console.log(`Error to block patient ${idPatient}. Error: ${error}`);
        }
        socket.to(idPatient).emit("patientBlocked", 1);
      });
    });

    socket.on("disconnect", reason => {
      console.log(`Socket ID ${socket.id} disconnected, reason: ${reason} `);
    });
  });
};
