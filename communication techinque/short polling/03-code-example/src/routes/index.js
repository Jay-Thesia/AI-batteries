import { Router } from "express";
import { config } from "../config/index.js";
import { messageRoutes } from "../modules/message/message.routes.js";

/**
 * Public URL surface — mount domain routers here.
 */
export function buildApiRouter() {
  const api = Router();

  api.get("/health", (_req, res) => {
    res.status(200).json({ ok: true, technique: "short-polling" });
  });

  api.get("/meta", (_req, res) => {
    res.status(200).json({
      technique: "short-polling",
      pollIntervalMs: config.pollIntervalMs,
    });
  });

  api.use("/messages", messageRoutes);

  return api;
}
