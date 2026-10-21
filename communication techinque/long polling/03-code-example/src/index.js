import { seedDatabase } from "./db/seed.js";
import { startServer } from "./server/createServer.js";

async function main() {
  seedDatabase();

  const { url } = await startServer();

  console.log(`Long polling inbox ready at ${url}`);
  console.log("Open the URL in a browser, or try the curl examples in README.md");
}

main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
