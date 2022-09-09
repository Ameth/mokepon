const sectionSeleccionarAtaque = document.getElementById("seleccionar-ataque");
const sectionReiniciar = document.getElementById("reiniciar");
const sectionVerMapa = document.getElementById("ver-mapa");
const mapa = document.getElementById("mapa");
const botonMascotaJugador = document.getElementById("boton-mascota");
const botonReiniciar = document.getElementById("boton-reiniciar");

const sectionSeleccionarMascota = document.getElementById(
  "seleccionar-mascota"
);
const tarjetas = document.getElementById("tarjetas");
const tarjetasAtaques = document.getElementById("tarjetas-ataques");

const containerMascotaJugador = document.getElementById("mascota-jugador");
const containerMascotaEnemigo = document.getElementById("mascota-enemigo");

const spanVidasJugador = document.getElementById("vidas-jugador");
const spanVidasEnemigo = document.getElementById("vidas-enemigo");

const sectionMensajes = document.getElementById("resultado");
const ataquesDelJugador = document.getElementById("ataques-del-jugador");
const ataquesDelEnemigo = document.getElementById("ataques-del-enemigo");

const mokepones = [];
let ataqueJugador = [];
let ataqueEnemigo = [];
let listaAtaquesEnemigo = [];

let victoriasJugador = 0;
let victoriasEnemigo = 0;

let mascotaJugador;
let mascotaEnemigo;

let inputHipodoge;
let inputCapipepo;
let inputRatigueya;

let botonesAtaques = [];

let lienzo = mapa.getContext("2d");
let intervalo;
let mapaBackground = new Image();
mapaBackground.src = "./assets/mokemap.png";
let mapaAncho = window.innerWidth - 20;
const mapaAnchoMaximo = 800;

if (mapaAncho > mapaAnchoMaximo) {
  mapaAncho = mapaAnchoMaximo - 20;
}

let mapaAlto = (mapaAncho * 600) / 800;
mapa.width = mapaAncho;
mapa.height = mapaAlto;

let indexAtak = 0;

class Mokepon {
  constructor(nombre, imagen, vidas) {
    this.nombre = nombre;
    this.imagen = imagen;
    this.vidas = vidas;
    this.ataques = [];
    this.ancho = 100;
    this.alto = 100;
    this.x = aleatorio(10, mapa.width - this.ancho);
    this.y = aleatorio(10, mapa.height - this.alto);
    this.mapaImagen = new Image();
    this.mapaImagen.src = imagen;
    this.velocidadX = 0;
    this.velocidadY = 0;
  }

  dibujar() {
    lienzo.drawImage(this.mapaImagen, this.x, this.y, this.ancho, this.alto);
  }
}

let hipodoge = new Mokepon("Hipodoge", "./assets/tierra.png", 5);
let capipepo = new Mokepon("Capipepo", "./assets/agua.png", 5);
let ratigueya = new Mokepon("Ratigueya", "./assets/fuego.png", 5);

hipodoge.ataques.push(
  { nombre: "🌱", id: "boton-tierra" },
  { nombre: "🌱", id: "boton-tierra" },
  { nombre: "🌱", id: "boton-tierra" },
  { nombre: "💧", id: "boton-agua" },
  { nombre: "🔥", id: "boton-fuego" }
);

capipepo.ataques.push(
  { nombre: "💧", id: "boton-agua" },
  { nombre: "💧", id: "boton-agua" },
  { nombre: "💧", id: "boton-agua" },
  { nombre: "🌱", id: "boton-tierra" },
  { nombre: "🔥", id: "boton-fuego" }
);

ratigueya.ataques.push(
  { nombre: "🔥", id: "boton-fuego" },
  { nombre: "🔥", id: "boton-fuego" },
  { nombre: "🔥", id: "boton-fuego" },
  { nombre: "🌱", id: "boton-tierra" },
  { nombre: "💧", id: "boton-agua" }
);

mokepones.push(hipodoge, capipepo, ratigueya);

// console.log(mokepones);

function iniciarJuego() {
  // Cargar la configuración inicial del juego
  mokepones.forEach((mokepon) => {
    const moke = `<input type="radio" name="mascota" id="${mokepon.nombre}" class="check-mascota" />
        <label class="tarjeta-de-mokepon" for="${mokepon.nombre}">
            <p>${mokepon.nombre}</p>
            <img src="${mokepon.imagen}" alt="${mokepon.nombre}">
        </label>`;
    tarjetas.innerHTML += moke;
  });

  botonReiniciar.addEventListener("click", reiniciarJuego);

  sectionSeleccionarAtaque.style.display = "none";
  sectionReiniciar.style.display = "none";
  sectionVerMapa.style.display = "none";

  botonMascotaJugador.addEventListener("click", seleccionarMascotaJugador);

  unirseAlJuego();
}

function unirseAlJuego() {
  //Llamar al servidor Express para agregar el jugador
  fetch("http://localhost:8080/join").then((res) => {
    if (res.ok) {
      res.text().then((respuesta) => {
        console.log(respuesta);
      });
    }
  });
}

function seleccionarMascotaJugador() {
  // Selecciona la mascota al que el usuario le de click

  const listaMascotas = document.querySelectorAll(".check-mascota");
  // console.log(listaMascotas);

  let selected = false;

  listaMascotas.forEach((item) => {
    // console.log(item);

    if (item.checked) {
      mascotaJugador = mokepones.find((mascota) => mascota.nombre === item.id);
      // console.log(mascotaJugador);
      selected = true;
    }
  });

  if (selected) {
    sectionSeleccionarMascota.style.display = "none";

    extraerAtaques(mascotaJugador.nombre);
    mostrarMascotaJugador(mascotaJugador.nombre);
    seleccionarMascotaEnemigo();
    sectionVerMapa.style.display = "flex";
    iniciarMapa();
  } else {
    alert("Debes seleccionar una mascota");
  }
}

function iniciarMapa() {
  // Inicia la configuración del mapa, incluyendo los listeners para escuchar cuando se presionen las flechas del teclado
  // mapa.width = 800;
  // mapa.height = 600;
  intervalo = setInterval(dibujarCanvas, 50);

  window.addEventListener("keydown", moverConTeclado);
  window.addEventListener("keyup", detenerMovimiento);

  console.log(mascotaJugador);
  console.log(mascotaEnemigo);
}

function dibujarCanvas() {
  // Muestra las mascotas seleccionadas en el mapa
  mascotaJugador.x = mascotaJugador.x + mascotaJugador.velocidadX;
  mascotaJugador.y = mascotaJugador.y + mascotaJugador.velocidadY;

  lienzo.clearRect(0, 0, mapa.clientWidth, mapa.height);
  lienzo.drawImage(mapaBackground, 0, 0, mapa.width, mapa.height);
  mascotaJugador.dibujar();
  mascotaEnemigo.dibujar();
  if (mascotaJugador.velocidadX !== 0 || mascotaJugador.velocidadY !== 0) {
    revisarColision();
    detenerEnBordesDelMapa();
  }

  // console.log("Dibujando");
}

function moverDerecha() {
  mascotaJugador.velocidadX = 5;
}

function moverIzquierda() {
  mascotaJugador.velocidadX = -5;
}

function moverArriba() {
  mascotaJugador.velocidadY = -5;
}

function moverAbajo() {
  mascotaJugador.velocidadY = 5;
}

function detenerMovimiento() {
  mascotaJugador.velocidadX = 0;
  mascotaJugador.velocidadY = 0;
}

function moverConTeclado(event) {
  switch (event.keyCode) {
    case 37: // Flecha izquierda
      moverIzquierda();
      break;
    case 38: // Flecha arriba
      moverArriba();
      break;
    case 39: // Flecha derecha
      moverDerecha();
      break;
    case 40: // Flecha abajo
      moverAbajo();
      break;
    default:
      break;
  }
}

function revisarColision() {
  // Verificar si las mascotas colisionaron en el mapa

  const arribaEnemigo = mascotaEnemigo.y + 50;
  const abajoEnemigo = mascotaEnemigo.y + mascotaEnemigo.alto - 50;
  const derechaEnemigo = mascotaEnemigo.x + mascotaEnemigo.ancho - 50;
  const izquierdaEnemigo = mascotaEnemigo.x + 50;

  const arribaJugador = mascotaJugador.y;
  const abajoJugador = mascotaJugador.y + mascotaJugador.alto;
  const derechaJugador = mascotaJugador.x + mascotaJugador.ancho;
  const izquierdaJugador = mascotaJugador.x;

  if (
    abajoJugador < arribaEnemigo ||
    arribaJugador > abajoEnemigo ||
    derechaJugador < izquierdaEnemigo ||
    izquierdaJugador > derechaEnemigo
  ) {
    return;
  }

  detenerMovimiento();
  clearInterval(intervalo);

  sectionVerMapa.style.display = "none";
  sectionSeleccionarAtaque.style.display = "flex";
}

function detenerEnBordesDelMapa() {
  // Verificar si las mascotas ya llegaron al borde del mapa

  const arribaMapa = 0;
  const abajoMapa = mapa.height - mascotaJugador.alto;
  const derechaMapa = mapa.width;
  const izquierdaMapa = 0;

  const arribaJugador = mascotaJugador.y;
  const derechaJugador = mascotaJugador.x + mascotaJugador.ancho;
  const izquierdaJugador = mascotaJugador.x;

  if (arribaJugador < arribaMapa) {
    mascotaJugador.y = arribaMapa;
  }

  if (arribaJugador > abajoMapa) {
    mascotaJugador.y = abajoMapa;
  }

  if (derechaJugador > derechaMapa) {
    mascotaJugador.x = derechaMapa - mascotaJugador.ancho;
  }

  if (izquierdaJugador < izquierdaMapa) {
    mascotaJugador.x = izquierdaMapa;
  }

  // console.log(abajoJugador, mascotaJugador.y);
}

function mostrarMascotaJugador(mascotaJugador) {
  // Mostrar el nombre y la imagen de la mascota escogida
  mokepones.forEach((mokepon) => {
    if (mokepon.nombre === mascotaJugador) {
      containerMascotaJugador.innerHTML = `<img src="${mokepon.imagen}" alt="${mokepon.nombre}">
      <p>${mokepon.nombre}</p>`;
    }
  });
}

function extraerAtaques(mascota) {
  // Dependiendo de la mascota escogida, se buscan que ataques tiene para guardarlos en un array y luego enviar a renderizarlos
  let ataques;
  mokepones.forEach((mokepon) => {
    if (mokepon.nombre === mascota) {
      ataques = mokepon.ataques;
    }
  });
  //   console.log(ataques);
  mostrarAtaques(ataques);
}

function mostrarAtaques(ataquesMascota) {
  // Renderiza los botones con los ataques de la mascota del jugador
  ataquesMascota.forEach((ataque, ind) => {
    const nomAtaque =
      ataque.nombre === "💧"
        ? "Agua"
        : ataque.nombre === "🌱"
        ? "Tierra"
        : "Fuego";
    const btnAtaque = `<button id="${ataque.id}${ind}" class="boton-de-ataque">${nomAtaque} ${ataque.nombre}</button>`;
    tarjetasAtaques.innerHTML += btnAtaque;
  });

  // Agrego en una variable de array los botones de los ataques para poder añadirles los eventos de click
  botonesAtaques = document.querySelectorAll(".boton-de-ataque");
}

function seleccionarMascotaEnemigo() {
  // Se selecciona una mascota para el enemigo de forma aleatoria, luego se extrae el nombre y sus ataques
  let idEnemigo = aleatorio(0, mokepones.length - 1);

  mascotaEnemigo = mokepones[idEnemigo];

  containerMascotaEnemigo.innerHTML = `<img src="${mascotaEnemigo.imagen}" alt="${mascotaEnemigo.nombre}">
  <p>${mascotaEnemigo.nombre}</p>`;

  listaAtaquesEnemigo = mascotaEnemigo.ataques;
  // console.log(listaAtaquesEnemigo);

  secuenciaAtaque();
}

function secuenciaAtaque() {
  // Funcion que agrega los eventos de click a los botones de ataque del jugador, que agrega a un array cada uno de los ataques que escoja el usuario
  botonesAtaques.forEach((boton) => {
    boton.addEventListener("click", (e) => {
      //   console.log(e);
      if (e.target.textContent === "Agua 💧") {
        ataqueJugador.push("AGUA");
        boton.style.background = "#112f58";
        boton.disabled = true;
      } else if (e.target.textContent === "Tierra 🌱") {
        ataqueJugador.push("TIERRA");
        boton.style.background = "#112f58";
        boton.disabled = true;
      } else {
        ataqueJugador.push("FUEGO");
        boton.style.background = "#112f58";
        boton.disabled = true;
      }
      // console.log("Jugador", ataqueJugador);
      ataqueAleatorioEnemigo();
    });
  });
}

function ataqueAleatorioEnemigo() {
  // Se selecciona un ataque de la lista de ataques que tiene el enemigo, y cuando este es utilizado sale del array para dejar solo los que tiene disponibles
  let ataqueAleatorio = aleatorio(0, listaAtaquesEnemigo.length - 1);
  // console.log(ataqueAleatorio);

  if (listaAtaquesEnemigo[ataqueAleatorio].nombre === "💧") {
    ataqueEnemigo.push("AGUA");
    listaAtaquesEnemigo.splice(ataqueAleatorio, 1);
  } else if (listaAtaquesEnemigo[ataqueAleatorio].nombre === "🌱") {
    ataqueEnemigo.push("TIERRA");
    listaAtaquesEnemigo.splice(ataqueAleatorio, 1);
  } else if (listaAtaquesEnemigo[ataqueAleatorio].nombre === "🔥") {
    ataqueEnemigo.push("FUEGO");
    listaAtaquesEnemigo.splice(ataqueAleatorio, 1);
  }

  // console.log("Enemigo", ataqueEnemigo);
  // console.log("AtaquesEnemigo", listaAtaquesEnemigo);

  combate();

  if (ataqueJugador.length === 5) {
    // combate();
  }
}

function combate() {
  // Comparar cada uno de lo ataques para verificar el resultado por cada uno

  if (ataqueJugador[indexAtak] === ataqueEnemigo[indexAtak]) {
    crearMensaje(
      "EMPATE",
      ataqueJugador[indexAtak] + "🟡",
      ataqueEnemigo[indexAtak] + "🟡"
    );
  } else if (
    ataqueJugador[indexAtak] === "FUEGO" &&
    ataqueEnemigo[indexAtak] === "TIERRA"
  ) {
    crearMensaje(
      "GANASTE",
      ataqueJugador[indexAtak] + "✅",
      ataqueEnemigo[indexAtak] + "❌"
    );
    victoriasJugador++;
    spanVidasJugador.innerHTML = victoriasJugador;
  } else if (
    ataqueJugador[indexAtak] === "TIERRA" &&
    ataqueEnemigo[indexAtak] === "AGUA"
  ) {
    crearMensaje(
      "GANASTE",
      ataqueJugador[indexAtak] + "✅",
      ataqueEnemigo[indexAtak] + "❌"
    );
    victoriasJugador++;
    spanVidasJugador.innerHTML = victoriasJugador;
  } else if (
    ataqueJugador[indexAtak] === "AGUA" &&
    ataqueEnemigo[indexAtak] === "FUEGO"
  ) {
    crearMensaje(
      "GANASTE",
      ataqueJugador[indexAtak] + "✅",
      ataqueEnemigo[indexAtak] + "❌"
    );
    victoriasJugador++;
    spanVidasJugador.innerHTML = victoriasJugador;
  } else {
    crearMensaje(
      "PERDISTE",
      ataqueJugador[indexAtak] + "❌",
      ataqueEnemigo[indexAtak] + "✅"
    );
    victoriasEnemigo++;
    spanVidasEnemigo.innerHTML = victoriasEnemigo;
  }

  indexAtak++;

  //Para generar la scuencia de ataque primero y luego combatir, se generar un ciclo for

  // for (let i = 0; i < ataqueJugador.length; i++) {
  //   if (ataqueJugador[i] === ataqueEnemigo[i]) {
  //     crearMensaje("EMPATE", ataqueJugador[i] + "🟡", ataqueEnemigo[i] + "🟡");
  //   } else if (ataqueJugador[i] === "FUEGO" && ataqueEnemigo[i] === "TIERRA") {
  //     crearMensaje("GANASTE", ataqueJugador[i] + "✅", ataqueEnemigo[i] + "❌");
  //     victoriasJugador++;
  //     spanVidasJugador.innerHTML = victoriasJugador;
  //   } else if (ataqueJugador[i] === "TIERRA" && ataqueEnemigo[i] === "AGUA") {
  //     crearMensaje("GANASTE", ataqueJugador[i] + "✅", ataqueEnemigo[i] + "❌");
  //     victoriasJugador++;
  //     spanVidasJugador.innerHTML = victoriasJugador;
  //   } else if (ataqueJugador[i] === "AGUA" && ataqueEnemigo[i] === "FUEGO") {
  //     crearMensaje("GANASTE", ataqueJugador[i] + "✅", ataqueEnemigo[i] + "❌");
  //     victoriasJugador++;
  //     spanVidasJugador.innerHTML = victoriasJugador;
  //   } else {
  //     crearMensaje(
  //       "PERDISTE",
  //       ataqueJugador[i] + "❌",
  //       ataqueEnemigo[i] + "✅"
  //     );
  //     victoriasEnemigo++;
  //     spanVidasEnemigo.innerHTML = victoriasEnemigo;
  //   }
  // }

  // revisarVictorias();

  if (ataqueJugador.length === 5) {
    revisarVictorias();
  }
}

function crearMensaje(resultado, ataqueActualJugador, ataqueActualEnemigo) {
  // Crear el mensaje con el resultado de cada uno de los ataques y mostrar con qué atacó cada jugador
  let nuevoAtaqueDelJugador = document.createElement("p");
  let nuevoAtaqueDelEnemigo = document.createElement("p");

  sectionMensajes.innerHTML = resultado;
  nuevoAtaqueDelJugador.innerHTML = ataqueActualJugador;
  nuevoAtaqueDelEnemigo.innerHTML = ataqueActualEnemigo;

  ataquesDelJugador.appendChild(nuevoAtaqueDelJugador);
  ataquesDelEnemigo.appendChild(nuevoAtaqueDelEnemigo);
}

function revisarVictorias() {
  // Verificar si gano el jugador o el enemigo
  if (victoriasEnemigo === victoriasJugador) {
    crearMensajeFinal("¡EMPATE! 😌");
  } else if (victoriasJugador > victoriasEnemigo) {
    crearMensajeFinal("¡GANASTE! 😎");
  } else {
    crearMensajeFinal("¡PERDISTE! 😭");
  }
}

function crearMensajeFinal(resultadoFinal) {
  // Crear el mensaje final del resultado de la batalla
  sectionMensajes.innerHTML = resultadoFinal;
  sectionReiniciar.style.display = "block";
}

function reiniciarJuego() {
  // Recargar la página para reiniciar el juego
  location.reload();
}

function aleatorio(min, max) {
  // Generar un número aleatorio entre dos números, inclusives
  return Math.floor(Math.random() * (max - min + 1) + min);
}

window.addEventListener("load", iniciarJuego);
