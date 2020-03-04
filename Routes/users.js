const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../Models/users");

const route = express();
const saltRounds = 10;

route.get("/userlist", async (req, res) => {
  // let io = req.app.get("socketio");

  User.find({ level: 1 }, function(error, users) {
    if (error) {
      console.log("Error to get all user list: ", error);

      res.json({
        error: true,
        title: "Error Find",
        msg: "Hubo un error al intentar consultar todos los usuarios"
      });
    }

    res.json({
      error: false,
      msg: users
    });
  });
});

route.get("/userdata/:idUser", async (req, res) => {
  const { idUser } = req.params;

  User.findById(idUser, async (error, userData) => {
    if (error) {
      console.log(`Error searching userData ID ${idUser}. Error: ${error}`);

      res.json({
        error: true,
        title: "Error User",
        msg: "Se produjo un error al intentar traer los datos de este usuario"
      });
    }

    res.status(400).json({
      error: false,
      msg: userData
    });
  });
});

route.get("/mydoctor/:myId", async (req, res) => {
  const { myId } = req.params;

  User.findById(myId, "doctor", async (error, idDoctor) => {
    if (error) {
      console.log(`Error searching doctor of ${myId}. Error: ${error}`);

      res.json({
        error: true,
        title: "Error búsqueda",
        msg: "Hubo un error al intentar obtener el ID de su doctor"
      });
    }

    User.findById(idDoctor.doctor, async function(error, doctor) {
      if (error) {
        console.log("Error searching doctor: ", error);

        res.json({
          error: true,
          title: "Error Datos",
          msg: "Hubo un error al tratar obtener los datos de su doctor"
        });
      }

      res.json({
        error: false,
        msg: doctor
      });
    });
  });
});

route.get("/doctorlist", async (req, res) => {
  User.find({ level: 2 }, async (error, doctors) => {
    if (error) {
      console.log("Error to query doctor list: ", error);

      res.json({
        error: true,
        title: "Lista de doctores",
        msg:
          "Hubo un error al tratar de consultar la lista de doctores, intente más tarde"
      });
    }

    res.json({
      error: false,
      msg: doctors
    });
  });
});

route.post("/register", async (req, res) => {
  const {
    name,
    lastname,
    email,
    genre,
    birthday,
    password,
    tokenNotification,
    doctor
  } = req.body;

  User.findOne({ email: email }, async function(error, exists) {
    if (error) {
      console.log(
        `Error trying to validate existing email ${email}. Error: ${error}`
      );
      res.json({
        error: true,
        title: "Error de Consulta",
        msg:
          "Hubo un error al intentar validar el correo existente, por favor informe de este error"
      });
    }

    if (exists === null) {
      let passwordHashed = await bcrypt.hash(password, saltRounds);

      User.create(
        {
          name: name,
          lastname: lastname,
          email: email,
          birthday: birthday,
          genre: genre,
          password: passwordHashed,
          tokenNotifications: tokenNotification,
          level: 1,
          doctor: doctor
        },
        function(error, saved) {
          if (error) {
            console.log(
              `Error trying to save data of email ${email}. Error: ${error}`
            );
            res.json({
              error: true,
              title: "Error de Guardado",
              msg:
                "Hubo un error al intentar guardar sus datos, por favor informe de este error"
            });
          }

          res.json({
            error: false,
            title: "Registrado",
            msg: "Se ha registrado con éxito en la aplicación"
          });
        }
      );
    } else {
      res.json({
        error: false,
        title: "Correo registrado",
        msg:
          "El correo que ha colocado ya está registrado en nuesta base de datos"
      });
    }
  });
});

route.post("/login", async (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email: email }, async function(error, exists) {
    if (error) {
      console.log(
        `Error trying to check the data of email ${email}. Error: ${error}`
      );
      res.json({
        error: true,
        title: "Error de Consulta",
        msg:
          "Hubo un error al intentar consultar sus datos, por favor informe de este error"
      });
    }

    if (exists === null) {
      res.json({
        error: true,
        title: "No existe",
        msg: "El correo insertado no se encuentra registrado"
      });
    } else {
      let match = await bcrypt.compare(password, exists.password);

      if (match) {
        res.json({
          error: false,
          msg: {
            myId: exists._id,
            level: exists.level
          }
        });
      } else {
        res.json({
          error: true,
          title: "Contraseña",
          msg: "La contraseña insertada no es correcta"
        });
      }
    }
  });
});

module.exports = route;
