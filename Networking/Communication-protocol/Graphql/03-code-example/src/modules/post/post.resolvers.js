import { userService } from "../user/user.service.js";
import { postService } from "./post.service.js";

export const postResolvers = {
  Query: {
    posts: () => postService.findAll(),
  },

  Mutation: {
    createPost: (_parent, args) =>
      postService.create({
        title: args.title,
        authorId: args.authorId,
      }),
  },

  Post: {
    // Nested field: post { author { ... } }
    author: (post) => {
      const user = userService.findById(post.authorId);
      if (!user) {
        throw new Error(`Missing author for post ${post.id}`);
      }
      return user;
    },
  },
};
