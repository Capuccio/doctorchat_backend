const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../Models/users");
const axios = require("axios");

const route = express();
const saltRounds = 10;

route.get("/patientslist/:myId", async (req, res) => {
  const { myId } = req.params;

  User.find({ doctor: myId }, function(error, users) {
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

      res
        .status(400)
        .json({
          error: true,
          title: "Error User",
          msg: "Se produjo un error al intentar traer los datos"
        })
        .end();
    }

    res.status(200).json({
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

        res
          .json({
            error: true,
            title: "Error Datos",
            msg: "Hubo un error al tratar obtener los datos de su doctor"
          })
          .end();
      }

      res.json({
        error: false,
        msg: doctor
      });
    });
  });
});

route.get("/doctorlist/:status", async (req, res) => {
  const { status } = req.params;

  User.find({ level: 2, status }, async (error, doctors) => {
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
    level,
    status,
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

      let profilePicture =
        genre == "M"
          ? "https://i.imgur.com/ihhfBI4.jpg"
          : "https://i.imgur.com/u3fYPb8.jpg";

      User.create(
        {
          name: name,
          lastname: lastname,
          email: email,
          birthday: birthday,
          genre: genre,
          password: passwordHashed,
          tokenNotifications: tokenNotification,
          profilePicture: profilePicture,
          deleteHashPicture: "default",
          level: level,
          status: status,
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
            msg: "Te has registrado con éxito en la aplicación"
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
            level: exists.level,
            status: exists.status
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

route.post("/unlockuser", async (req, res) => {
  const { idPatient } = req.body;

  User.findByIdAndUpdate(
    idPatient,
    { $set: { status: 1 } },
    (error, updated) => {
      if (error) {
        console.log(`Error to unlock ID ${idPatient}. Error: ${error}`);

        res.json({
          error: true,
          title: "Error Update",
          msg: "Hubo un error al desbloquear el usuario, intente más tarde"
        });
      }

      res.json({
        error: false
      });
    }
  );
});

route.put("/updatedata", async (req, res) => {
  let query = {
    name: req.body.name,
    lastname: req.body.lastname,
    genre: req.body.genre,
    birthday: req.body.birthday
  };

  if (req.body.profilePicture64 != "") {
    try {
      let answerImgur = await axios.post(
        "https://api.imgur.com/3/upload",
        {
          image: req.body.profilePicture64
        },
        {
          headers: {
            Authorization: `Client-ID 19608087303677a`
          }
        }
      );

      let { data } = answerImgur.data;

      query.profilePicture = data.link;
    } catch (error) {
      console.log("Error Axios", error);
    }
  }

  if (req.body.newPassword != "") {
    let hash = await bcrypt.hash(req.body.newPassword, saltRounds);
    query.password = hash;
  }

  User.findByIdAndUpdate(req.body._id, query, (error, updated) => {
    if (error) {
      console.log(`Error to update ID: ${req.body._id}. Error: ${error}`);

      res
        .json({
          error: true,
          title: "Error Update",
          msg:
            "Hubo un error al intentar actualizar sus datos, por favor reporte este error"
        })
        .end();
    }

    res
      .json({
        error: false,
        title: "Datos actualizados",
        msg: "Sus datos han sido actualizados correctamente"
      })
      .end();
  });
});

route.put("/acceptdoctor", async (req, res) => {
  const { idDoctor, option } = req.body;

  User.findByIdAndUpdate(idDoctor, { status: option }, (error, updated) => {
    if (error) {
      if (error) {
        console.log(
          `Error to change status of ID: ${idDoctor}. Error: ${error}`
        );

        res
          .json({
            error: true,
            title: "Error Status",
            msg:
              "Hubo un error al intentar aceptar/rechazar el doctor, por favor reportarlo"
          })
          .end();
      }
    }

    res.json({
      error: false,
      title: option === 1 ? "Doctor aceptado" : "Doctor rechazado",
      msg:
        option === 1
          ? "El doctor ha sido aceptado sin problemas, ahora podrá iniciar sesión"
          : "El doctor ha sido rechazado, no podrá utilizar la cuenta registrada"
    });
  });
});

module.exports = route;
