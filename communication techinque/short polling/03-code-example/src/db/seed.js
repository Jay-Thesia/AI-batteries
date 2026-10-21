import { store } from "./store.js";

/**
 * Seed data for local development / learning.
 */
export function seedDatabase() {
  store.messages = [
    { id: "101", author: "Ada", text: "Inbox is live.", createdAt: "2026-01-01T10:00:00.000Z" },
    { id: "102", author: "Grace", text: "Poll me for updates.", createdAt: "2026-01-01T10:00:05.000Z" },
  ];

  store.sequences.messageId = 102;
}
