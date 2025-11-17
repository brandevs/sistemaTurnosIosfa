const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

let llamados = [];
let ultimoTurno = null;

io.on("connection", (socket) => {
  console.log("Cliente conectado");
  socket.emit("historial", llamados);

  socket.on("nuevo-turno", (data) => {
    llamados.unshift(data);
    ultimoTurno = data;
    if (llamados.length > 5) llamados.pop();
    io.emit("turno-llamado", data);
  });

  socket.on("reiniciar", () => {  
    llamados = [];
    ultimoTurno = null;
    io.emit("reiniciar-lista");
  });
});

// 🔹 Página principal actual
app.get("/", (req, res) => res.redirect("/panel.html"));

// 🔹 Nueva página solo Medicamentos
app.get("/medicamentos", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "medicamentos.html"));
});

// 🔹 Nueva página solo Autorizaciones
app.get("/autorizaciones", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "autorizaciones.html"));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Servidor iniciado en http://localhost:${PORT}`));
