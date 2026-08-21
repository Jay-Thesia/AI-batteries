# WebSockets — Full Mental Model

> Goal: after reading this, you should be able to *think* in connections and frames, not treat WS as “faster REST.”

---

## 1. What problem does a WebSocket solve?

HTTP is great at: client asks, server answers, connection can die.

Live products also need:

- Server speaks **without** being asked each time
- Client speaks **often** without a new handshake
- Tiny messages (cursor moved, keystroke, tick)

**WebSocket** starts as HTTP, then **upgrades** into a long-lived, **full-duplex** TCP (usually TLS) pipe.

After the upgrade, there is no “request URL per message.” There are **frames** on one connection. You invent the meaning of those frames.

---

## 2. Core mental model (keep this forever)

```
1. Client:  GET /ws   Upgrade: websocket
2. Server:  101 Switching Protocols
3. Both:    frames ────────────────────────────────►
            frames ◄────────────────────────────────
4. Either side closes; reconnect is your problem
```

A WebSocket is:

> “We already said hello in HTTP. Now this TCP connection is a bidirectional byte pipe. Don’t hang up.”

Mental shift:

| HTTP thinking | WebSocket thinking |
|---|---|
| One URL per action | One connection, many message **types** |
| Headers every request | Handshake once; then small frames |
| Stateless (ideally) | Server **holds** sockets |
| Status code per call | Your JSON `{ type, error }` is the status |
| CDN caches GET | Almost nothing is cacheable here |

WebSocket is a **transport**. REST/GraphQL/your chat protocol still have to exist *on top* of it.

---

## 3. The handshake (why it starts with HTTP)

Browsers speak HTTP already. The upgrade reuses that:

```http
GET /ws HTTP/1.1
Host: localhost:4013
Connection: Upgrade
Upgrade: websocket
Sec-WebSocket-Key: ...
Sec-WebSocket-Version: 13
```

```http
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: ...
```

After 101, that TCP connection is no longer “an HTTP response.” Proxies that don’t understand Upgrade will break you. That’s why WS sometimes fails at hotels / corporate networks, and why long polling / SSE still matter.

---

## 4. Frames vs your message protocol

The browser gives you `send(string)` and `onmessage`. That is **not** an API design.

You still need a contract, for example:

```json
{ "type": "hello", "lastId": "103" }
{ "type": "message", "id": "104", "author": "Ada", "text": "hi" }
{ "type": "send", "text": "hi" }
{ "type": "error", "message": "text required" }
```

Rules that save you later:

- Every payload has a **`type`**
- Events that must not duplicate have an **`id`**
- Client tells **`lastId`** on hello so the server can catch them up
- Auth happens at handshake (cookie / query token) or as a first `auth` frame — then you reject unknown sockets

GraphQL subscriptions, Socket.IO, Slack RTM — all are **message protocols** riding WebSockets (or similar).

---

## 5. Who is connected? (server state)

Unlike a GET handler, the server has a **set of live sockets**.

```
on connection:
  sockets.add(ws)
  send missed messages since lastId

on "send":
  save message
  for each socket: send { type: "message", ... }

on close / error:
  sockets.delete(ws)
```

This is the cost:

- Memory per connection
- Load balancer **stickiness** or a pub/sub so instance B can notify sockets on instance A
- Heartbeats so a half-open TCP doesn’t sit forever

`ws.ping()` / `pong` (or an app-level `{ type: "ping" }`) every 15–30s is normal. If pong is missing, **terminate** the socket.

---

## 6. Reconnect is part of the product

Phones sleep. Laptops close. Networks change.

A production client:

1. Notices close / error
2. Backs off with jitter (1s, 2s, 4s… cap at 30s)
3. Opens a new socket
4. Sends `lastId` and **replays** (or HTTP GET the gap, then subscribe)

If you skip step 4, users miss chat lines during a tunnel flicker. The cursor idea from polling **still applies**.

Many teams use HTTP for the catch-up GET and WebSocket only for the live tail. That’s a good design, not a cop-out.

---

## 7. What “sending” looks like in the demo

HTTP still useful:

```http
POST /messages
{ "author": "Ada", "text": "hi" }
```

That POST can **broadcast** to all sockets. Mutations stay easy to debug with curl. The socket is the notification bus.

And/or the client sends on the socket:

```json
{ "type": "send", "author": "Ada", "text": "hi" }
```

Same service function, two entry points. That’s the healthy split: **domain in the service**, **transport in the adapter**.

---

## 8. Load math

After handshake, a message to 10,000 clients is 10,000 frames — not 10,000 HTTP request cycles. That’s the win vs polling.

The bill:

- 10,000 sockets on your process (or fleet)
- heartbeat traffic even when idle
- a pub/sub if you have more than one node

If users only need a tick every 30s, **don’t** pay this bill. Poll.

---

## 9. WebSocket vs the rest

### WebSocket shines when:
- Duplex chatter (chat, games, collab editing)
- High event rate
- You can operate connections (heartbeats, reconnect, fan-out)

### SSE is better when:
- Server → client only
- You want automatic browser reconnect (`EventSource`)
- HTTP/2 multiplexing is enough

### Long polling is better when:
- Upgrade is blocked
- You want one held GET and a JSON blob, nothing fancier

### Short polling is better when:
- Delay is fine and you want zero connection state

### HTTP request/response is still better when:
- File upload, OAuth redirect, cacheable reads, “user clicked Save”

---

## 10. Common mistakes

1. **Rebuilding REST over WS** (`{ method, url, body }` for everything) — you lost HTTP semantics and gained none of REST’s tooling  
2. **No message `type`** — unparseable soup  
3. **No cursor on reconnect** — silent data loss  
4. **No heartbeat** — zombies and “it works on my wifi”  
5. **Auth only on the first page load, not the socket**  
6. **Assuming one process** — broadcast dies across instances without Redis/NATS  
7. **Skipping HTTP entirely** — harder to test, harder to cache, harder to reason about writes

---

## 11. Full picture in one diagram

```text
Client ── GET Upgrade /ws ──► 101
       ◄► frames (send / message / error / ping)
                 │
                 ▼
          Socket registry
                 │
     POST /messages or WS "send"
                 │
                 ▼
           Message store
                 │
                 ▼
        broadcast to all sockets
```

Your job when learning WebSockets:
1. Treat it as a **pipe**, not an API style
2. Design a **typed message protocol**
3. Register / unregister sockets
4. Heartbeat and reconnect with a **cursor**
5. Keep HTTP for the things HTTP is good at

---

## 12. Mini glossary

- **Upgrade / 101**: HTTP turning into a WebSocket
- **Frame**: one WS-level chunk (text or binary)
- **Message protocol**: your JSON `type`s on top of frames
- **Duplex**: both sides send without taking turns
- **Heartbeat / ping-pong**: liveness check
- **Fan-out / broadcast**: one event, many sockets
- **Sticky session**: balancer keeps a client on one node (or use pub/sub instead)

---

## 13. What “good understanding” looks like

You understand WebSockets when you can answer:

1. Why does the handshake start with HTTP?
2. Why is WS not a replacement for REST/GraphQL by itself?
3. What state does the server now hold?
4. What happens on reconnect without a cursor?
5. When would polling or SSE still win?

If those answers are clear, your mental model is solid.

---

## Next step

Open:
- `03-code-example/` and run the server
- Open **two browser tabs** and send a message — the other tab should update without refresh
- Also `POST` with curl and watch both tabs receive the broadcast
