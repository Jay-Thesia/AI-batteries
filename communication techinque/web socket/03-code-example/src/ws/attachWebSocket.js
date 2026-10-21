import { WebSocketServer, WebSocket } from "ws";
import { config } from "../config/index.js";
import { messageService } from "../modules/message/message.service.js";

function send(socket, payload) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(payload));
  }
}

/**
 * WebSocket adapter — transport only. Domain writes go through messageService.
 */
export function attachWebSocket(httpServer) {
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  function broadcast(payload, except = null) {
    for (const client of wss.clients) {
      if (client !== except) {
        send(client, payload);
      }
    }
  }

  function publishMessage(message) {
    broadcast({ type: "message", message });
  }

  wss.on("connection", (socket) => {
    socket.isAlive = true;

    socket.on("pong", () => {
      socket.isAlive = true;
    });

    send(socket, {
      type: "hello",
      latestId: messageService.latestId(),
    });

    socket.on("message", (raw) => {
      let body;
      try {
        body = JSON.parse(String(raw));
      } catch {
        send(socket, { type: "error", message: "invalid JSON" });
        return;
      }

      if (body.type === "catchup") {
        const messages = messageService.findAfter(body.lastId ?? "");
        send(socket, { type: "snapshot", messages, latestId: messageService.latestId() });
        return;
      }

      if (body.type === "send") {
        try {
          const message = messageService.create({
            author: body.author,
            text: body.text,
          });
          broadcast({ type: "message", message });
        } catch (error) {
          send(socket, { type: "error", message: error.message });
        }
        return;
      }

      send(socket, { type: "error", message: `unknown type: ${body.type}` });
    });
  });

  const heartbeat = setInterval(() => {
    for (const socket of wss.clients) {
      if (socket.isAlive === false) {
        socket.terminate();
        continue;
      }
      socket.isAlive = false;
      socket.ping();
    }
  }, config.heartbeatMs);

  wss.on("close", () => {
    clearInterval(heartbeat);
  });

  return { wss, publishMessage };
}
