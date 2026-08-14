import { postService } from "../post/post.service.js";
import { userService } from "./user.service.js";

export const userResolvers = {
  Query: {
    users: () => userService.findAll(),
    user: (_parent, args) => userService.findById(args.id),
  },

  User: {
    // Nested field: user { posts { ... } }
    posts: (user) => postService.findByAuthorId(user.id),
  },
};
