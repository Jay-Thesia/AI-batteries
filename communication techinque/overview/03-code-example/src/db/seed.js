import { store } from "./store.js";

/**
 * Seed data for local development / learning.
 */
export function seedDatabase() {
  store.messages = [
    { id: "101", author: "Ada", text: "Same inbox. Three pipes.", createdAt: "2026-01-01T10:00:00.000Z" },
    { id: "102", author: "Grace", text: "Watch the counters, not just the list.", createdAt: "2026-01-01T10:00:05.000Z" },
  ];

  store.sequences.messageId = 102;
}
