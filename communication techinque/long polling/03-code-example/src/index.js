import { seedDatabase } from "./db/seed.js";
import { startServer } from "./server/createServer.js";

async function main() {
  seedDatabase();

  const { url } = await startServer();

  console.log(`GraphQL API ready at ${url}`);
  console.log("Try the operations in README.md");
}

main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
