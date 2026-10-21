import { nextCommentId, store } from "../../db/store.js";
import { escapeHtml } from "../../security/escapeHtml.js";

/**
 * Comment domain service — HTTP adapters call this.
 * Persistence stores raw text. Escaping is an output concern.
 */
export const commentService = {
  findAll() {
    return store.comments;
  },

  toPublic(comment) {
    return {
      ...comment,
      escapedText: escapeHtml(comment.text),
    };
  },

  create({ author, text }) {
    const trimmed = String(text ?? "").trim();
    if (!trimmed) {
      const error = new Error("text is required");
      error.statusCode = 400;
      throw error;
    }

    if (trimmed.length > 500) {
      const error = new Error("text must be 500 characters or less");
      error.statusCode = 400;
      throw error;
    }

    const comment = {
      id: nextCommentId(),
      author: String(author ?? "").trim() || "Anon",
      text: trimmed,
      createdAt: new Date().toISOString(),
    };

    store.comments.push(comment);
    return comment;
  },
};
