import { seedDatabase } from "./db/seed.js";
import { startServer } from "./server/createServer.js";

async function main() {
  seedDatabase();

  const { url } = await startServer();

  console.log(`Communication techniques overview ready at ${url}`);
  console.log("Open the URL and compare short poll / long poll / WebSocket counters");
}

main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
