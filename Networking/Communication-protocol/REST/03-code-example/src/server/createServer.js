import express from "express";
import { config } from "../config/index.js";
import { buildApiRouter } from "../routes/index.js";

/**
 * HTTP bootstrap — transport only.
 */
export function createServer() {
  const app = express();

  app.use(express.json());
  app.use(buildApiRouter());

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
