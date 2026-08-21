import { seedDatabase } from "./db/seed.js";
import { startServer } from "./server/createServer.js";

async function main() {
  seedDatabase();

  const { url } = await startServer();

  console.log(`WebSocket inbox ready at ${url}`);
  console.log(`Socket endpoint: ${url.replace("http", "ws")}/ws`);
  console.log("Open two browser tabs, or try the curl + ws examples in README.md");
}

main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
