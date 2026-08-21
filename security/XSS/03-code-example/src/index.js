import { seedDatabase } from "./db/seed.js";
import { startServer } from "./server/createServer.js";

async function main() {
  seedDatabase();

  const { url } = await startServer();

  console.log(`XSS comment wall ready at ${url}`);
  console.log("Post markup-looking text — it should stay letters on the page");
}

main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
