import { Router } from "express";
import { config } from "../config/index.js";
import { messageService } from "../modules/message/message.service.js";
import { waiterHub } from "../techniques/waiters.js";

/**
 * Same inbox, three HTTP shapes. WebSocket is attached in createServer.
 */
export function buildApiRouter({ onCreate }) {
  const api = Router();

  api.get("/health", (_req, res) => {
    res.status(200).json({ ok: true, technique: "overview" });
  });

  api.get("/meta", (_req, res) => {
    res.status(200).json({
      waitTimeoutMs: config.waitTimeoutMs,
      latestId: messageService.latestId(),
    });
  });

  api.get("/short/messages", (req, res) => {
    const after = typeof req.query.after === "string" ? req.query.after : "";
    res.status(200).json({
      messages: messageService.findAfter(after),
      latestId: messageService.latestId(),
    });
  });

  api.get("/long/messages/wait", (req, res) => {
    const after = typeof req.query.after === "string" ? req.query.after : "";
    waiterHub.wait(req, res, after);
  });

  api.get("/messages", (req, res) => {
    const after = typeof req.query.after === "string" ? req.query.after : "";
    res.status(200).json({
      messages: messageService.findAfter(after),
      latestId: messageService.latestId(),
    });
  });

  api.post("/messages", (req, res) => {
    try {
      const message = messageService.create(req.body ?? {});
      onCreate(message);
      res.status(201).json(message);
    } catch (error) {
      const status = error.statusCode ?? 500;
      res.status(status).json({ error: error.message });
    }
  });

  return api;
}
