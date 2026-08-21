import { Router } from "express";
import { messageController } from "./message.controller.js";

/**
 * Message URL surface.
 * GET /wait is the long-poll. GET / is an immediate snapshot.
 */
export const messageRoutes = Router();

messageRoutes.get("/wait", messageController.wait);
messageRoutes.get("/", messageController.list);
messageRoutes.post("/", messageController.create);
