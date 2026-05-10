import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { addJob } from "./queue";

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

// 🔥 sockets solo para debug (opcional)
io.on("connection", (socket) => {
  console.log("🟢 cliente conectado:", socket.id);
});

// 🔥 entrada única desde Next.js
app.post("/emit", (req, res) => {
  const { events, payload } = req.body;

  if (!events || !Array.isArray(events)) {
    return res.status(400).json({ ok: false });
  }

  events.forEach((event) => {
    io.emit(event, payload);
  });

  return res.json({ ok: true });
});

server.listen(4000, () => {
  console.log("🚀 Print server en 4000");
});