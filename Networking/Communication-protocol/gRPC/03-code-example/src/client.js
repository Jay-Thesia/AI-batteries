import * as grpc from "@grpc/grpc-js";
import { config } from "./config/index.js";
import { loadBlogPackage } from "./grpc/loadProto.js";

function promisifyUnary(client, methodName, request) {
  return new Promise((resolve, reject) => {
    client[methodName](request, (error, response) => {
      if (error) reject(error);
      else resolve(response);
    });
  });
}

async function main() {
  const blog = loadBlogPackage();
  const target = `localhost:${config.port}`;
  const client = new blog.BlogService(
    target,
    grpc.credentials.createInsecure(),
  );

  console.log(`\nCalling gRPC server at ${target}\n`);

  const users = await promisifyUnary(client, "listUsers", {});
  console.log("1) ListUsers");
  console.log(JSON.stringify(users, null, 2));

  const user = await promisifyUnary(client, "getUser", { id: "1" });
  console.log("\n2) GetUser(id=1)");
  console.log(JSON.stringify(user, null, 2));

  const posts = await promisifyUnary(client, "listPostsByUser", {
    userId: "1",
  });
  console.log("\n3) ListPostsByUser(user_id=1)");
  console.log(JSON.stringify(posts, null, 2));

  const created = await promisifyUnary(client, "createPost", {
    title: "My first gRPC post",
    authorId: "1",
  });
  console.log("\n4) CreatePost");
  console.log(JSON.stringify(created, null, 2));

  console.log("\nDone.\n");
  client.close();
}

main().catch((error) => {
  console.error("Client failed:", error.message || error);
  process.exit(1);
});
