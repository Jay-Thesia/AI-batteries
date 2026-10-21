# Long Polling — Full Mental Model

> Goal: after reading this, you should be able to *think* in held requests, not treat this as “slow short polling.”

---

## 1. What problem does long polling solve?

Short polling wastes answers. Most replies are “nothing changed.”

You still want:
- ordinary HTTP (works through most proxies)
- low latency when an event *does* happen
- no WebSocket infrastructure yet

**Long polling** keeps HTTP request/response, but **delays the response**.

The client says: “Answer me when you have a delta, or when you’ve waited long enough.”

The server parks that request in memory and **completes it later**.

---

## 2. Core mental model (keep this forever)

```
Client                         Server
  │  GET /wait?after=103         │
  │ ───────────────────────────► │  (held — no body yet)
  │                              │
  │         ... time passes ...  │
  │                              │  POST creates id 104
  │  200 { messages: [104] }     │
  │ ◄─────────────────────────── │
  │  GET /wait?after=104         │
  │ ───────────────────────────► │  (held again)
```

A long poll is:

> “Don’t answer until the world is different from my cursor — unless you must, because timers and proxies exist.”

Mental shift:

| Short polling | Long polling |
|---|---|
| Answer immediately | Answer when ready |
| Sleep on the **client** | Wait on the **server** |
| Empty 200s are frequent | Empty 200s mean **timeout**, then retry |
| Stateless per tick | Server remembers waiters until reply |

It is still **one request, one response**. It is not a socket. After the response, the conversation is over. The client must open the next wait immediately.

---

## 3. The wait loop (client)

```
cursor = lastId

loop:
  response = GET /messages/wait?after=cursor&timeout=25000
  apply(response.messages)
  cursor = response.latestId
  // no sleep — open the next wait now
```

Two rules:

1. **Retry immediately after a response** (data *or* timeout)
2. **Never overlap waits** for the same cursor stream (one in-flight GET)

A tiny `setTimeout(0)` or 50ms delay after errors is fine. Sleeping 2 seconds after a *successful timeout* re-introduces short-poll latency and misses the point.

---

## 4. The waiter list (server)

This is the part that is not a normal REST handler.

```
waiters = []   // { after, resolve, timer }

on GET /wait:
  delta = messagesAfter(after)
  if delta.length: return immediately
  else park this request in waiters

on POST /messages:
  save message
  wake every waiter whose cursor is now stale
  each waiter gets the delta and is removed

on timeout:
  return { messages: [], latestId: after }
  remove waiter
```

You are now holding **HTTP connections as data**. That is the cost:

- RAM for the waiter object
- a file descriptor / socket
- a timer per request (or a shared sweep)

If the client hangs up, you **must** remove the waiter or you leak memory. Listen for `req.close` / `res.on("close")`.

---

## 5. What the HTTP looks like

```http
GET /messages/wait?after=103 HTTP/1.1
Host: localhost:4012
```

The connection sits there. Then either:

**News**

```http
HTTP/1.1 200 OK
Content-Type: application/json

{ "messages": [{ "id": "104", "text": "hi" }], "latestId": "104" }
```

**Timeout (still success)**

```http
HTTP/1.1 200 OK
Content-Type: application/json

{ "messages": [], "latestId": "103" }
```

Timeouts are not errors. They exist because:

- load balancers kill idle HTTP (~30–60s is a common default)
- you need a chance to re-auth / notice a crashed server
- clients can confirm “I am still here”

Pick a timeout **shorter than the proxy idle timeout**. 20–25 seconds is a popular teaching default.

Disable response buffering for this route if a reverse proxy would hold the body. For JSON-at-the-end long poll, buffering is actually fine — you send nothing until you’re done. (SSE is the technique that needs unbuffered streaming.)

---

## 6. Race: event arrives while nobody is waiting

Timeline:

1. Wait returns with message 104
2. Client is between requests (a few milliseconds)
3. Message 105 is created
4. Client opens wait with `after=104`

If step 3 happens in that gap, the new wait’s **immediate delta check** must return 105. That is why the handler always looks at the store **before** parking.

If you only wake waiters on POST and skip the “already newer?” check, you drop events. This is the #1 long-poll bug.

---

## 7. Load and fairness

1000 clients almost-idle:

- ~1000 held connections (the tax)
- ~1000 new waits per timeout period (the heartbeat)
- 1 POST fans out to 1000 completions — a **thundering herd** of responses

Mitigations:

- Cap waiters per user
- Broadcast via pub/sub (Redis) so multiple Node processes share events
- Don’t do this with a single in-memory array in production multi-instance without a bus

Long polling **does not** give you WebSocket fanout for free. Horizontal scale still needs a pub/sub.

---

## 8. Errors

- Client abort → remove waiter, do not `res.json` on a destroyed response
- 5xx on wait → backoff, **keep cursor**
- Auth expired mid-wait → 401, client refreshes token, new wait
- Duplicate delivery: make apply **idempotent** (keyed by message id)

---

## 9. Long polling vs the rest

### Long polling shines when:
- You want near-push on HTTP/1
- Client mostly listens
- WebSockets are blocked or not worth the ops yet
- Event rate is modest

### Short polling is better when:
- You refuse to hold connections
- A 15s delay is fine
- Server is a dumb file/CDN

### WebSocket is better when:
- Client sends continuously
- You are tired of reconnect-on-every-message
- You need frames both ways with less HTTP overhead

### SSE is a sibling:
- Server streams many events on **one** HTTP response
- Browser reconnects for you
- Still not duplex

---

## 10. Common mistakes

1. **Sleeping after timeout** like a short poller  
2. **Parking before checking the store** (lost events in the gap)  
3. **No timeout** (zombie requests vs proxies)  
4. **Leaking waiters** on client disconnect  
5. **One Node process memory waiters** behind a load balancer with two nodes and no pub/sub  
6. **Calling it a WebSocket** — it is still request/response

---

## 11. Full picture in one diagram

```text
Client ── GET /wait?after=X ──►  Waiter list ──► (held)
                                      ▲
POST /messages ── save ── wake waiters ┘
                                      │
Client ◄── 200 delta or empty timeout─┘
Client ── GET /wait?after=X' ──►  (held again)
```

Your job when learning long polling:
1. Hold the request, don’t sleep the client
2. Check the store **before** parking
3. Timeout on purpose
4. Clean up disconnects
5. Resume from a cursor, always

---

## 12. Mini glossary

- **Waiter**: parked HTTP request waiting for a delta
- **Hold / park**: delay `res.json` until an event or timeout
- **Timeout empty**: 200 with `[]` meaning “ask again”
- **Gap race**: event between two waits — fixed by immediate delta check
- **Fan-out**: one write completing many waiters
- **Pub/sub**: how multiple servers share “wake up” signals

---

## 13. What “good understanding” looks like

You understand long polling when you can answer:

1. Who is waiting — client timer or server?
2. Why timeout empty is success?
3. How do you not drop events between waits?
4. What do you leak if you ignore `req.close`?
5. When is a WebSocket still the better pipe?

If those answers are clear, your mental model is solid.

---

## Next step

Open:
- `03-code-example/` and run the server
- In the demo, start waiting, then post a message — the wait should finish **immediately**
- Watch a timeout fire if you do nothing
