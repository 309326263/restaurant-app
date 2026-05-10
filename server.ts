import { createServer } from "http";
import next from "next";
import { initSocket } from "./server/socket";

const app = next({ dev: true });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  initSocket(httpServer);

  httpServer.listen(3000, () => {
    console.log("🚀 Server listo en http://localhost:3000");
  });
});