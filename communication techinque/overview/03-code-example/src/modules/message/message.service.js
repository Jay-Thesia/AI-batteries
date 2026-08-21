import { nextMessageId, store } from "../../db/store.js";

/**
 * Message domain service — all three techniques call this.
 */
export const messageService = {
  findAfter(afterId) {
    if (!afterId) {
      return store.messages;
    }

    const index = store.messages.findIndex((message) => message.id === afterId);
    if (index === -1) {
      return store.messages;
    }

    return store.messages.slice(index + 1);
  },

  latestId() {
    return store.messages.at(-1)?.id ?? "0";
  },

  create({ author, text }) {
    const trimmed = String(text ?? "").trim();
    if (!trimmed) {
      const error = new Error("text is required");
      error.statusCode = 400;
      throw error;
    }

    const message = {
      id: nextMessageId(),
      author: String(author ?? "").trim() || "Anon",
      text: trimmed,
      createdAt: new Date().toISOString(),
    };

    store.messages.push(message);
    return message;
  },
};
