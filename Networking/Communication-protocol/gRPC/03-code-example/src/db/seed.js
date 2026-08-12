import { store } from "./store.js";

/**
 * Seed data for local development / learning.
 */
export function seedDatabase() {
  store.users = [
    { id: "1", name: "Ada", email: "ada@example.com" },
    { id: "2", name: "Grace", email: "grace@example.com" },
  ];

  store.posts = [
    { id: "101", title: "Hello gRPC", authorId: "1" },
    { id: "102", title: "Proto first thinking", authorId: "1" },
    { id: "103", title: "RPCs are functions", authorId: "2" },
  ];

  store.sequences.postId = 103;
}
