import { WebSocketServer, WebSocket } from "ws";
import { config } from "../config/index.js";
import { messageService } from "../modules/message/message.service.js";
import { waiterHub } from "../techniques/waiters.js";

function send(socket, payload) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(payload));
  }
}

export function attachWebSocket(httpServer) {
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  function publishMessage(message) {
    for (const client of wss.clients) {
      send(client, { type: "message", message });
    }
  }

  wss.on("connection", (socket) => {
    socket.isAlive = true;
    socket.on("pong", () => {
      socket.isAlive = true;
    });

    send(socket, { type: "hello", latestId: messageService.latestId() });

    socket.on("message", (raw) => {
      let body;
      try {
        body = JSON.parse(String(raw));
      } catch {
        send(socket, { type: "error", message: "invalid JSON" });
        return;
      }

      if (body.type === "catchup") {
        send(socket, {
          type: "snapshot",
          messages: messageService.findAfter(body.lastId ?? ""),
          latestId: messageService.latestId(),
        });
        return;
      }

      if (body.type === "send") {
        try {
          const message = messageService.create({
            author: body.author,
            text: body.text,
          });
          waiterHub.notifyAll();
          publishMessage(message);
        } catch (error) {
          send(socket, { type: "error", message: error.message });
        }
      }
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

  return { publishMessage };
}
