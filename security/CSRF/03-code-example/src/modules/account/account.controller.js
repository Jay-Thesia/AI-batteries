import { userService } from "./account.service.js";
import {
  clearSessionCookie,
  createSession,
  destroySession,
  sessionCookie,
} from "../../security/session.js";

/**
 * Auth + account controllers — thin HTTP adapters.
 */
export const accountController = {
  login(req, res) {
    const user = userService.findByName(req.body?.name);
    if (!user) {
      return res.status(401).json({ error: "Unknown user — try Ada" });
    }

    const session = createSession(user.id);
    res.setHeader("Set-Cookie", sessionCookie(session.id));
    return res.status(200).json({
      name: user.name,
      email: user.email,
      csrfToken: session.csrfToken,
    });
  },

  logout(req, res) {
    destroySession(req);
    res.setHeader("Set-Cookie", clearSessionCookie());
    return res.status(204).end();
  },

  session(req, res) {
    const user = userService.findById(req.session.userId);
    return res.status(200).json({
      name: user.name,
      email: user.email,
      csrfToken: req.session.csrfToken,
    });
  },

  updateEmail(req, res) {
    try {
      const user = userService.updateEmail(req.session.userId, req.body?.email);
      return res.status(200).json({
        name: user.name,
        email: user.email,
      });
    } catch (error) {
      const status = error.statusCode ?? 500;
      return res.status(status).json({ error: error.message });
    }
  },
};
