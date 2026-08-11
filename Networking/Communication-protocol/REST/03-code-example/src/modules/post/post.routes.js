import { Router } from "express";
import { postController } from "./post.controller.js";

/**
 * Post resource routes.
 */
export const postRoutes = Router();

postRoutes.get("/", postController.list);
postRoutes.get("/:id", postController.getById);
postRoutes.post("/", postController.create);
