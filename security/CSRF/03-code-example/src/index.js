import { seedDatabase } from "./db/seed.js";
import { startServer } from "./server/createServer.js";

async function main() {
  seedDatabase();

  const { url } = await startServer();

  console.log(`CSRF account page ready at ${url}`);
  console.log("Log in as Ada, then change email with a token — without one it should fail");
}

main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
