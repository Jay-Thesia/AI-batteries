import { ApolloServer } from "@apollo/server";
import { typeDefs } from "./typeDefs.js";
import { resolvers } from "./resolvers.js";

export function createApolloServer() {
  return new ApolloServer({
    typeDefs,
    resolvers,
  });
}
