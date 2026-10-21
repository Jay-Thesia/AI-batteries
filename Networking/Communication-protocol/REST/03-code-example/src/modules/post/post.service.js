import { nextPostId, store } from "../../db/store.js";
import { userService } from "../user/user.service.js";

/**
 * Post domain service.
 */
export const postService = {
  findAll() {
    return store.posts;
  },

  findById(id) {
    return store.posts.find((post) => post.id === id) ?? null;
  },

  findByAuthorId(authorId) {
    return store.posts.filter((post) => post.authorId === authorId);
  },

  create({ title, authorId }) {
    const author = userService.findById(authorId);
    if (!author) {
      const error = new Error(`No user found with id ${authorId}`);
      error.statusCode = 400;
      throw error;
    }

    const post = {
      id: nextPostId(),
      title,
      authorId,
    };

    store.posts.push(post);
    return post;
  },
};
