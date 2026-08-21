import { store } from "./store.js";

/**
 * Seed data for local development / learning.
 */
export function seedDatabase() {
  store.users = [
    { id: "1", name: "Ada", email: "ada@example.com" },
  ];
  store.sessions.clear();
}
