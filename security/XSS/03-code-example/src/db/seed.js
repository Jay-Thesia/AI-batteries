import { store } from "./store.js";

/**
 * Seed data for local development / learning.
 * One row looks like markup on purpose — it must still render as letters.
 */
export function seedDatabase() {
  store.comments = [
    {
      id: "101",
      author: "Ada",
      text: "Hello from the comment wall.",
      createdAt: "2026-01-01T10:00:00.000Z",
    },
    {
      id: "102",
      author: "Grace",
      text: "Angle brackets like <this> should stay letters, not become tags.",
      createdAt: "2026-01-01T10:01:00.000Z",
    },
  ];

  store.sequences.commentId = 102;
}
