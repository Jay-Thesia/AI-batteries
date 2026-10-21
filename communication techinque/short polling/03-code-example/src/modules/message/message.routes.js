import { Router } from "express";
import { messageController } from "./message.controller.js";

/**
 * Message URL surface.
 */
export const messageRoutes = Router();

messageRoutes.get("/", messageController.list);
messageRoutes.post("/", messageController.create);
