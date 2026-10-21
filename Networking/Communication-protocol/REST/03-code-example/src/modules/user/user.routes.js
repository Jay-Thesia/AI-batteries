import { Router } from "express";
import { userController } from "./user.controller.js";

/**
 * User resource routes.
 */
export const userRoutes = Router();

userRoutes.get("/", userController.list);
userRoutes.get("/:id", userController.getById);
userRoutes.get("/:id/posts", userController.listPosts);
