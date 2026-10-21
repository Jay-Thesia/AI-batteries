import { Router } from "express";
import { commentController } from "./comment.controller.js";

/**
 * Comment URL surface — JSON in, JSON out. The page never string-builds HTML.
 */
export const commentRoutes = Router();

commentRoutes.get("/", commentController.list);
commentRoutes.post("/", commentController.create);
