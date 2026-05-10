import express from "express";
import http from "http";
import { initSocket } from "./socket";

const app = express();
const server = http.createServer(app);

initSocket(server);

server.listen(3000, () => {
  console.log("🚀 Backend + Socket running on 3000");
});