import { Router } from "express";
import { userRoutes } from "../modules/user/user.routes.js";
import { postRoutes } from "../modules/post/post.routes.js";

/**
 * Public URL surface — mount domain routers here.
 */
export function buildApiRouter() {
  const api = Router();

  api.get("/health", (_req, res) => {
    res.status(200).json({ ok: true });
  });

  api.use("/users", userRoutes);
  api.use("/posts", postRoutes);

  return api;
}
