import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "../config/index.js";
import { buildApiRouter } from "../routes/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * HTTP bootstrap — transport only.
 */
export function createServer() {
  const app = express();

  app.use(express.json());
  app.use(buildApiRouter());
  app.use(express.static(path.join(__dirname, "../../public")));

  app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  return app;
}

export function startServer() {
  const app = createServer();

  return new Promise((resolve, reject) => {
    const server = app.listen(config.port, () => {
      resolve({
        app,
        server,
        url: `http://localhost:${config.port}`,
      });
    });

    server.on("error", reject);
  });
}
