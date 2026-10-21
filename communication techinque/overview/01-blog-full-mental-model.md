# Communication Techniques — Full Mental Model

> Goal: after reading this, you should be able to *pick* a delivery pattern on purpose, not mix it up with REST or GraphQL.

---

## 1. What problem do communication techniques solve?

Apps need **fresh data**.

A chat message arrives. A stock ticks. A job finishes. Someone else liked a post.

The server already knows. The client does not — until something **moves bytes**.

**API contracts** (REST, GraphQL, gRPC) answer:

- What is the shape of the data?
- Which resource / procedure / field am I talking about?

**Communication techniques** answer a different question:

> How does the client learn that something changed — without wasting work, and without being late?

That is a **timing and transport** problem, not a schema problem.

You can poll a REST endpoint. You can long-poll a GraphQL query. You can stream gRPC. You can put JSON over a WebSocket. The contract and the delivery pattern are independent knobs.

---

## 2. Core mental model (keep this forever)

Every live feature is a loop:

```
Something happens on the server
        │
        ▼
Client somehow finds out
        │
        ▼
UI updates
```

The techniques differ only in **who waits**, **who speaks first**, and **whether the connection dies after each answer**.

| Technique | Who asks? | Connection lifetime | Typical latency | Waste |
|---|---|---|---|---|
| Short polling | Client, on a timer | One HTTP request per tick | Up to your interval | High (empty answers) |
| Long polling | Client, then waits | One HTTP request held open | Near-instant when data exists | Medium (reconnects) |
| WebSocket | Either side, anytime | One long-lived TCP/TLS socket | Near-instant both ways | Low (after handshake) |
| SSE (cousin) | Server pushes | One long-lived HTTP response | Near-instant server → client | Low (one direction) |

A request is basically:

> “I need updates. Should I keep knocking, camp at the door, or install an intercom?”

That is the whole idea.

---

## 3. Protocol vs technique (do not mix these)

This repo already has **communication protocols**:

- REST — resources + HTTP verbs
- GraphQL — client-chosen graph + one schema
- gRPC — RPC + Protobuf + HTTP/2

Those are **what you say**.

This folder is **how often you say it**, and **whether the pipe stays open**.

```text
┌─────────────────────────────────────┐
│           Your product UI           │
└──────────────────┬──────────────────┘
                   │
     ┌─────────────┴─────────────┐
     │  Communication technique  │  ← this pack
     │  poll / long-poll / WS    │
     └─────────────┬─────────────┘
                   │
     ┌─────────────┴─────────────┐
     │   Communication protocol  │  ← Networking/ folder
     │   REST / GraphQL / gRPC   │
     └─────────────┬─────────────┘
                   │
              TCP / TLS / HTTP
```

Mixing them up is the #1 beginner mistake:

- “We use GraphQL, so we don’t need WebSockets” — false (GraphQL subscriptions often *are* WebSockets)
- “We use REST, so we can only poll” — false (REST + SSE, REST + WS, REST + long poll all exist)
- “WebSocket is an API style like REST” — false (it’s a transport; you still invent a message protocol on top)

---

## 4. The four delivery patterns

### 1) Short polling — “ask again soon”

Client:

```
every 2 seconds:
  GET /messages?after=103
  → { "messages": [] }     // usually empty
```

Server answers **immediately**, even if nothing changed.

Good when:
- Updates are rare and delay of a few seconds is fine
- You must stay on boring HTTP (proxies, caches, simple hosts)
- Implementation simplicity beats efficiency

Pain:
- Empty responses dominate
- Interval is a lie: too short = load; too long = stale UI

### 2) Long polling — “I’ll wait for the answer”

Client:

```
GET /messages/wait?after=103
  ... connection stays open ...
  → { "messages": [ { "id": "104", "text": "hi" } ] }
immediately open the next wait
```

Server **holds** the request until:

- new data exists, or
- a timeout fires (then client retries)

Good when:
- You want push-like latency on plain HTTP
- Environments fight WebSockets (old proxies, some corporate networks)
- Event rate is low-to-medium

Pain:
- One held request per client = memory + file descriptors
- Must handle timeouts, disconnects, and “resume from last id”
- Still request/response — not a true duplex channel

### 3) WebSocket — “keep a two-way pipe”

Client and server upgrade HTTP once, then send frames whenever they want:

```
Client → { "type": "send", "text": "hi" }
Server → { "type": "message", "id": "104", "text": "hi" }
Server → { "type": "message", "id": "105", "text": "yo" }
```

Good when:
- Chat, multiplayer, collaborative cursors, live dashboards
- Client must **send** as often as it **receives**
- You care about per-message overhead after connect

Pain:
- You now own connection state, heartbeats, reconnect, backpressure
- Load balancers and sticky sessions get involved
- You must design a **message protocol** (types, ids, errors) yourself

### 4) SSE — the one-way cousin (know it exists)

**Server-Sent Events**: one HTTP response that never really ends. Server writes `data: ...\n\n` whenever it wants. Browser `EventSource` reconnects for you.

Good for: live feeds, notifications, stock tickers — **server → client only**.

If the client must talk back a lot, WebSocket usually wins. If you only need a firehose down, SSE is simpler than WS.

---

## 5. How a request actually travels (same inbox, three pipes)

Imagine one in-memory inbox. Three clients watch it.

**Short poll**

```
Client timer ──GET /messages?after=N──► Server
Client         ◄──[] immediately────── Server
(repeat)
```

**Long poll**

```
Client ──GET /messages/wait?after=N──► Server (holds)
   ... someone POSTs a message ...
Client ◄──[new messages]──────────── Server
Client ──GET /messages/wait?after=N'─► Server (holds again)
```

**WebSocket**

```
Client ── HTTP Upgrade ──► Server
Client ◄► frames forever ◄► Server
POST /messages (or a WS send) fans out to every socket
```

Notice: the **domain** is identical (`messages` + `after` cursor). Only the **waiting strategy** changes. That is the comparison you should feel in the code example.

---

## 6. Cursors, not “give me everything”

Live APIs need a **resume token**. In this pack it is `after=<messageId>`.

Without a cursor:

- Polls re-download the whole list
- A reconnect misses events or duplicates them
- You cannot prove “I am caught up”

With a cursor:

1. Client stores the last id it applied
2. Every request/frame means “anything **newer than this**”
3. Server returns only the delta

This idea is bigger than polling. Kafka offsets, Slack `oldest`, GraphQL subscriptions with `lastEventId` — same mental model.

---

## 7. Load: the honest numbers

1000 clients, 1 new message per 10 seconds.

| Technique | Requests / 10s (order of magnitude) | Held connections |
|---|---|---|
| Short poll every 2s | ~5000 mostly-empty GETs | 0 extra |
| Long poll | ~1000 waits + ~1000 replies | ~1000 |
| WebSocket | ~1000 frames out | ~1000 sockets |

Short polling **taxes the CPU and network** with empty work.  
Long polling and WebSockets **tax RAM and connection tables**.

Pick the tax you can afford.

Also: proxies timeout idle HTTP. Long poll timeouts (~20–30s) exist so a proxy does not kill you first. WebSockets need **heartbeats** (ping/pong) for the same reason.

---

## 8. Errors and reconnects

HTTP techniques fail like HTTP: 4xx/5xx, retry with backoff, resume from cursor.

WebSockets fail like connections: drop, TCP reset, phone sleeps. You must:

1. Detect death (pong timeout)
2. Reconnect with backoff
3. Replay from last cursor (often via a normal HTTP GET, then resume WS)

> Delivery technique does not remove failure. It changes *which* failure you design for.

A 200 with `{ messages: [] }` on a short poll is **success with no news**.  
A long-poll timeout with `{ messages: [] }` is also success — “still nothing, ask again.”  
A closed WebSocket is **not** success — the pipe is gone.

---

## 9. How to choose (honest comparison)

### Short polling shines when:
- Staleness of 2–30s is acceptable
- Event rate is low
- You want the dumbest possible client
- Infra forbids long-lived connections

### Long polling shines when:
- You want near-real-time on HTTP/1
- Bidirectional chatter is rare (client mostly listens)
- You cannot or will not run WebSockets yet

### WebSocket shines when:
- Both sides talk often
- Latency must be small
- Message rate would melt a poller
- You are willing to operate connections

### Still use a normal request when:
- The user clicked “Save”
- You need a request/response with a clear status code
- You do not need a live subscription at all

A good product often **mixes**: REST mutations + WebSocket notifications, or GraphQL queries + SSE for live fields.

---

## 10. Common mistakes

1. **Polling without a cursor** — re-fetching the world every tick  
2. **Polling too fast** — treating “real-time” as `setInterval(50)`  
3. **Long poll without timeout** — ghost connections until the proxy murders them  
4. **WebSocket as a replacement for HTTP** — file uploads, auth handshakes, and cacheable GETs still love HTTP  
5. **No backpressure** — producer faster than UI / DB; memory blows up  
6. **Forgetting multiple tabs** — 5 tabs × poll = 5× load unless you share a lock or a shared worker  
7. **Confusing this with GraphQL** — GraphQL subscriptions are a *contract* that often *uses* WebSockets underneath

---

## 11. Full picture in one diagram

```text
          ┌──────────────┐
          │   Client UI  │
          └──────┬───────┘
                 │
     ┌───────────┼───────────┐
     ▼           ▼           ▼
 Short poll   Long poll    WebSocket
 (timer HTTP) (held HTTP)  (duplex pipe)
     │           │           │
     └───────────┼───────────┘
                 ▼
          ┌──────────────┐
          │ Message API  │  ← same domain / same cursor
          └──────┬───────┘
                 ▼
            In-memory inbox
```

Your job when learning this:
1. Separate **contract** from **delivery**
2. Understand **who waits**
3. Always resume from a **cursor**
4. Budget **empty work vs held connections**
5. Know **when boring HTTP is enough**

---

## 12. Mini glossary

- **Short polling**: repeated short HTTP requests on a timer
- **Long polling**: HTTP request held until data or timeout
- **WebSocket**: upgraded, long-lived, bidirectional frames
- **SSE**: long-lived HTTP, server → client events
- **Cursor / `after`**: resume point so you only fetch deltas
- **Heartbeat**: traffic that proves the pipe is still alive
- **Backpressure**: slowing producers when consumers cannot keep up
- **Reconnect**: rebuild the pipe and catch up from the cursor

---

## 13. What “good understanding” looks like

You understand communication techniques when you can answer:

1. Why is this **not** the same topic as REST vs GraphQL?
2. Who waits in short poll vs long poll vs WebSocket?
3. Why does every live API need a cursor?
4. Which tax do you pay: empty requests, or held connections?
5. When would you still just `GET` on a button click?

If those answers are clear, your mental model is solid.

---

## Next step

Open:
- `03-code-example/` and run the comparison server
- Watch the **request counters** while you post one message
- Then go deep: `short polling/`, `long polling/`, `web socket/`
