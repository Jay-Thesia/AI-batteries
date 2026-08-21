import crypto from "node:crypto";
import { store } from "../db/store.js";
import { parseCookies, serializeCookie } from "./cookies.js";

export const SESSION_COOKIE = "sid";

function randomId() {
  return crypto.randomBytes(24).toString("hex");
}

export function createSession(userId) {
  const id = randomId();
  const csrfToken = randomId();
  store.sessions.set(id, { userId, csrfToken });
  return { id, csrfToken };
}

export function getSession(req) {
  const cookies = parseCookies(req.headers.cookie);
  const id = cookies[SESSION_COOKIE];
  if (!id) {
    return null;
  }

  const session = store.sessions.get(id);
  if (!session) {
    return null;
  }

  return { id, ...session };
}

export function destroySession(req) {
  const cookies = parseCookies(req.headers.cookie);
  const id = cookies[SESSION_COOKIE];
  if (id) {
    store.sessions.delete(id);
  }
}

export function sessionCookie(id) {
  return serializeCookie(SESSION_COOKIE, id, {
    httpOnly: true,
    sameSite: "Lax",
  });
}

export function clearSessionCookie() {
  return serializeCookie(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "Lax",
    maxAge: 0,
  });
}

/**
 * Cookie answers "who." This header answers "did our UI mean it."
 */
export function requireCsrf(req, res, next) {
  const session = req.session;
  const token = req.get("x-csrf-token");

  if (!session || !token || token !== session.csrfToken) {
    return res.status(403).json({
      error: "CSRF token missing or does not match the session",
    });
  }

  return next();
}
