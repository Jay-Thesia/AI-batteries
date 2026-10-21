import { config } from "../config/index.js";
import { messageService } from "../modules/message/message.service.js";

const waiters = new Set();

function payload(afterId, messages) {
  return {
    messages,
    latestId: messageService.latestId() || afterId || "0",
  };
}

function finish(waiter, messages) {
  if (waiter.done) {
    return;
  }

  waiter.done = true;
  clearTimeout(waiter.timer);
  waiters.delete(waiter);

  if (!waiter.res.writableEnded) {
    waiter.res.status(200).json(payload(waiter.afterId, messages));
  }
}

export const waiterHub = {
  wait(req, res, afterId) {
    const existing = messageService.findAfter(afterId);
    if (existing.length > 0) {
      return res.status(200).json(payload(afterId, existing));
    }

    const waiter = {
      afterId,
      res,
      done: false,
      timer: null,
    };

    waiter.timer = setTimeout(() => {
      finish(waiter, []);
    }, config.waitTimeoutMs);

    waiters.add(waiter);

    const onClose = () => {
      if (!waiter.done) {
        waiter.done = true;
        clearTimeout(waiter.timer);
        waiters.delete(waiter);
      }
    };

    req.on("close", onClose);
    res.on("close", onClose);
  },

  notifyAll() {
    for (const waiter of [...waiters]) {
      const messages = messageService.findAfter(waiter.afterId);
      if (messages.length > 0) {
        finish(waiter, messages);
      }
    }
  },
};
