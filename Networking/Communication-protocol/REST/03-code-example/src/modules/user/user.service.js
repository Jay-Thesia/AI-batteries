import { store } from "../../db/store.js";

/**
 * User domain service — controllers call this, not the store directly.
 */
export const userService = {
  findAll() {
    return store.users;
  },

  findById(id) {
    return store.users.find((user) => user.id === id) ?? null;
  },
};
