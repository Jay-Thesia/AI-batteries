import { nextPostId, store } from "../../db/store.js";
import { userService } from "../user/user.service.js";

/**
 * Post domain service.
 */
export const postService = {
  findAll() {
    return store.posts;
  },

  findByAuthorId(authorId) {
    return store.posts.filter((post) => post.authorId === authorId);
  },

  create({ title, authorId }) {
    const author = userService.findById(authorId);
    if (!author) {
      throw new Error(`No user found with id ${authorId}`);
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
