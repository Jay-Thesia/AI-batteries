import * as grpc from "@grpc/grpc-js";
import { config } from "../config/index.js";
import { userService } from "../modules/user/user.service.js";
import { postService } from "../modules/post/post.service.js";
import { loadBlogPackage } from "./loadProto.js";

function toUserMessage(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

function toPostMessage(post) {
  return {
    id: post.id,
    title: post.title,
    authorId: post.authorId,
  };
}

/**
 * Thin gRPC adapters over domain services.
 */
function createBlogHandlers() {
  return {
    getUser(call, callback) {
      const user = userService.findById(call.request.id);
      if (!user) {
        return callback({
          code: grpc.status.NOT_FOUND,
          message: `User not found: ${call.request.id}`,
        });
      }
      return callback(null, toUserMessage(user));
    },

    listUsers(_call, callback) {
      return callback(null, {
        users: userService.findAll().map(toUserMessage),
      });
    },

    listPostsByUser(call, callback) {
      const user = userService.findById(call.request.userId);
      if (!user) {
        return callback({
          code: grpc.status.NOT_FOUND,
          message: `User not found: ${call.request.userId}`,
        });
      }

      return callback(null, {
        posts: postService.findByAuthorId(user.id).map(toPostMessage),
      });
    },

    createPost(call, callback) {
      const { title, authorId } = call.request;

      if (!title || !authorId) {
        return callback({
          code: grpc.status.INVALID_ARGUMENT,
          message: "Both title and author_id are required",
        });
      }

      try {
        const post = postService.create({ title, authorId });
        return callback(null, toPostMessage(post));
      } catch (error) {
        return callback({
          code: grpc.status.INVALID_ARGUMENT,
          message: error.message,
        });
      }
    },
  };
}

/**
 * gRPC bootstrap — transport only.
 */
export function startServer() {
  const blog = loadBlogPackage();
  const server = new grpc.Server();

  server.addService(blog.BlogService.service, createBlogHandlers());

  const address = `${config.host}:${config.port}`;

  return new Promise((resolve, reject) => {
    server.bindAsync(
      address,
      grpc.ServerCredentials.createInsecure(),
      (error, port) => {
        if (error) {
          reject(error);
          return;
        }

        resolve({
          server,
          port,
          url: `localhost:${port}`,
        });
      },
    );
  });
}
