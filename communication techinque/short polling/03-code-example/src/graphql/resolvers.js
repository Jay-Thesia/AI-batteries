import { userResolvers } from "../modules/user/user.resolvers.js";
import { postResolvers } from "../modules/post/post.resolvers.js";

/**
 * Merge module resolvers.
 * In larger apps you'd use @graphql-tools/merge or a similar helper.
 */
export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...postResolvers.Query,
  },
  Mutation: {
    ...postResolvers.Mutation,
  },
  User: {
    ...userResolvers.User,
  },
  Post: {
    ...postResolvers.Post,
  },
};
