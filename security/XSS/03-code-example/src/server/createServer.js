import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "../config/index.js";
import { buildApiRouter } from "../routes/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Seatbelt headers. Encoding in the client is still the real XSS lock.
 */
function securityHeaders(_req, res, next) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
    ].join("; "),
  );
  next();
}

/**
 * HTTP bootstrap — JSON API + static comment wall.
 */
export function createServer() {
  const app = express();

  app.use(securityHeaders);
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
