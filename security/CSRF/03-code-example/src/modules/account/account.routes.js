import { Router } from "express";
import { accountController } from "./account.controller.js";
import { getSession, requireCsrf } from "../../security/session.js";

function requireSession(req, res, next) {
  const session = getSession(req);
  if (!session) {
    return res.status(401).json({ error: "Not logged in" });
  }

  req.session = session;
  return next();
}

/**
 * Account URL surface — login is cookie-only; writes also need the CSRF token.
 */
export const accountRoutes = Router();

accountRoutes.post("/login", accountController.login);
accountRoutes.post("/logout", accountController.logout);
accountRoutes.get("/session", requireSession, accountController.session);
accountRoutes.post(
  "/email",
  requireSession,
  requireCsrf,
  accountController.updateEmail,
);
