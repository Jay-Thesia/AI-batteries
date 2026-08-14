import { startStandaloneServer } from "@apollo/server/standalone";
import { config } from "../config/index.js";
import { createApolloServer } from "../graphql/schema.js";

export async function startServer() {
  const server = createApolloServer();

  const { url } = await startStandaloneServer(server, {
    listen: { port: config.port },
  });

  return { server, url };
}
