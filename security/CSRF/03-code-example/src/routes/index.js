import { Router } from "express";
import { accountRoutes } from "../modules/account/account.routes.js";

/**
 * Public URL surface — mount domain routers here.
 */
export function buildApiRouter() {
  const api = Router();

  api.get("/health", (_req, res) => {
    res.status(200).json({ ok: true });
  });

  api.use(accountRoutes);

  return api;
}
