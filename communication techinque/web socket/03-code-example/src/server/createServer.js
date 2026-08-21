import http from "node:http";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "../config/index.js";
import { buildApiRouter } from "../routes/index.js";
import { attachWebSocket } from "../ws/attachWebSocket.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * HTTP + WebSocket bootstrap — transport only.
 * Attach the socket server to the same HTTP server before listen().
 */
export function startServer() {
  const app = express();
  const server = http.createServer(app);
  const { publishMessage } = attachWebSocket(server);

  app.use(express.json());
  app.use(buildApiRouter(publishMessage));
  app.use(express.static(path.join(__dirname, "../../public")));

  app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  return new Promise((resolve, reject) => {
    server.listen(config.port, () => {
      resolve({
        app,
        server,
        url: `http://localhost:${config.port}`,
      });
    });

    server.on("error", reject);
  });
}
