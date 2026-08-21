import { Router } from "express";
import { createMessageController } from "./message.controller.js";

/**
 * Message URL surface — snapshot + mutation. Live updates ride /ws.
 */
export function createMessageRoutes(publishMessage) {
  const messageRoutes = Router();
  const messageController = createMessageController(publishMessage);

  messageRoutes.get("/", messageController.list);
  messageRoutes.post("/", messageController.create);

  return messageRoutes;
}
