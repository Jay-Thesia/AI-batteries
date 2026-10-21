import { seedDatabase } from "./db/seed.js";
import { startServer } from "./grpc/createServer.js";

async function main() {
  seedDatabase();

  const { url } = await startServer();

  console.log(`gRPC API ready at ${url}`);
  console.log("In another terminal run: npm run client");
}

main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
