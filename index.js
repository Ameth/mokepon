// import express from "express";
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const port = 8080;

const jugadores = [];

class Jugador {
  constructor(id) {
    this.id = id;
  }

  asignarMokepon(mokepon) {
    this.mokepon = mokepon;
  }

  actualizarPosicion(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Mokepon {
  constructor(nombre) {
    this.nombre = nombre;
  }
}

app.get("/join", (req, res) => {
  const id = `${Math.random()}`;
  const jugador = new Jugador(id);
  jugadores.push(jugador);

  res.setHeader("Access-Control-Allow-Origin", "*");

  res.send(id);
  //   res.send(jugadores);
});

app.post("/mokepon/:idJugador", (req, res) => {
  const idJugador = req.params.idJugador || "";
  const mascota = req.body.mokepon || "";
  const mokepon = new Mokepon(mascota);

  const jugadorIndex = jugadores.findIndex((item) => item.id === idJugador);

  if (jugadorIndex >= 0) {
    jugadores[jugadorIndex].asignarMokepon(mokepon);
  }

  console.log("Lista jugadores", jugadores);
  console.log("Id jugador actual", idJugador);
  res.end();
});

app.post("/mokepon/:idJugador/pos", (req, res) => {
  const idJugador = req.params.idJugador || "";
  const posX = req.body.posX || 0;
  const posY = req.body.posY || 0;

  const jugadorIndex = jugadores.findIndex((item) => item.id === idJugador);

  if (jugadorIndex >= 0) {
    jugadores[jugadorIndex].actualizarPosicion(posX, posY);
  }

  const enemigos = jugadores.filter((item) => {
    return idJugador !== item.id && item.mokepon;
  });

  res.send({
    enemigos,
  });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
