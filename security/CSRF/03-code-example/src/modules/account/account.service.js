import { store } from "../../db/store.js";

/**
 * User domain — email is the state CSRF would try to change.
 */
export const userService = {
  findByName(name) {
    const trimmed = String(name ?? "").trim();
    return store.users.find((user) => user.name === trimmed) ?? null;
  },

  findById(id) {
    return store.users.find((user) => user.id === id) ?? null;
  },

  updateEmail(userId, email) {
    const user = this.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const trimmed = String(email ?? "").trim();
    if (!trimmed || !trimmed.includes("@")) {
      const error = new Error("A valid email is required");
      error.statusCode = 400;
      throw error;
    }

    user.email = trimmed;
    return user;
  },
};
