import { messageService } from "./message.service.js";
import { waiterHub } from "./waiters.js";

/**
 * Message controllers — thin HTTP adapters over services.
 */
export const messageController = {
  list(req, res) {
    const after = typeof req.query.after === "string" ? req.query.after : "";
    const messages = messageService.findAfter(after);

    return res.status(200).json({
      messages,
      latestId: messageService.latestId(),
    });
  },

  wait(req, res) {
    const after = typeof req.query.after === "string" ? req.query.after : "";
    waiterHub.wait(req, res, after);
  },

  create(req, res) {
    try {
      const message = messageService.create(req.body ?? {});
      waiterHub.notifyAll();
      return res.status(201).json(message);
    } catch (error) {
      const status = error.statusCode ?? 500;
      return res.status(status).json({ error: error.message });
    }
  },
};
