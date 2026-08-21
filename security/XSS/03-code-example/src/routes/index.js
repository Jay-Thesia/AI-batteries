import { Router } from "express";
import { commentRoutes } from "../modules/comment/comment.routes.js";

/**
 * Public URL surface — mount domain routers here.
 */
export function buildApiRouter() {
  const api = Router();

  api.get("/health", (_req, res) => {
    res.status(200).json({ ok: true });
  });

  api.use("/comments", commentRoutes);

  return api;
}
