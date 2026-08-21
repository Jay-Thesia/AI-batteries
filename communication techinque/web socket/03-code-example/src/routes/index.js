import { Router } from "express";
import { config } from "../config/index.js";
import { createMessageRoutes } from "../modules/message/message.routes.js";

/**
 * Public URL surface — mount domain routers here.
 */
export function buildApiRouter(publishMessage) {
  const api = Router();

  api.get("/health", (_req, res) => {
    res.status(200).json({ ok: true, technique: "websocket" });
  });

  api.get("/meta", (_req, res) => {
    res.status(200).json({
      technique: "websocket",
      wsPath: "/ws",
      heartbeatMs: config.heartbeatMs,
    });
  });

  api.use("/messages", createMessageRoutes(publishMessage));

  return api;
}
