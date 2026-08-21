import { Router } from "express";
import { config } from "../config/index.js";
import { waiterHub } from "../modules/message/waiters.js";
import { messageRoutes } from "../modules/message/message.routes.js";

/**
 * Public URL surface — mount domain routers here.
 */
export function buildApiRouter() {
  const api = Router();

  api.get("/health", (_req, res) => {
    res.status(200).json({ ok: true, technique: "long-polling" });
  });

  api.get("/meta", (_req, res) => {
    res.status(200).json({
      technique: "long-polling",
      waitTimeoutMs: config.waitTimeoutMs,
      waiters: waiterHub.size(),
    });
  });

  api.use("/messages", messageRoutes);

  return api;
}
