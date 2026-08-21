# Short Polling — Full Mental Model

> Goal: after reading this, you should be able to *design* a poller, not just `setInterval` a GET.

---

## 1. What problem does short polling solve?

The client wants updates. The server will not call the client.

HTTP as originally used is **request → response → done**. There is no “server, ping me later.”

**Short polling** keeps that model and adds a clock:

1. Client asks “anything new since X?”
2. Server answers immediately
3. Client sleeps
4. Repeat

It solves “how do I notice changes?” with the **dumbest reliable tool**: ordinary HTTP GET.

It does **not** solve efficiency. Most answers will be empty.

---

## 2. Core mental model (keep this forever)

```
Client clock          Server
    │                    │
    │  GET ?after=103    │
    │ ─────────────────► │
    │  []  (200, now)    │
    │ ◄───────────────── │
    │  sleep 2s          │
    │  GET ?after=103    │
    │ ─────────────────► │
    │  [104]             │
    │ ◄───────────────── │
    │  remember after=104│
```

A poll is:

> “Give me the delta since my cursor. If there is none, say so **right now**.”

That last part is the whole difference from long polling. The request never waits for the future.

Mental shift:

| One-shot HTTP thinking | Short polling thinking |
|---|---|
| User clicks → one GET | Timer clicks → many GETs |
| Empty body is weird | Empty body is the common case |
| Fetch the resource | Fetch the **delta since cursor** |
| Latency = network | Latency = network + **interval** |

---

## 3. The loop (only four pieces)

1. **Cursor** — last id / timestamp you applied (`after=103`)
2. **Request** — `GET /messages?after=103`
3. **Apply** — render new rows, then advance the cursor
4. **Schedule** — `setTimeout` / `setInterval` / cron on the client

Miss any piece and the poller is wrong:

- No cursor → you re-download the world
- No apply-before-schedule → you can skip or double-apply under lag
- Fixed interval with overlapping requests → stampedes

Prefer **schedule the next poll after the current one finishes** (`setTimeout` in the `finally`) over a raw `setInterval`. Overlapping polls are a classic bug on slow networks.

---

## 4. What the HTTP looks like

```http
GET /messages?after=103 HTTP/1.1
Host: localhost:4011
```

Immediate empty:

```http
HTTP/1.1 200 OK
Content-Type: application/json

{ "messages": [], "latestId": "103" }
```

Immediate hit:

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "messages": [
    { "id": "104", "author": "Ada", "text": "Ship it", "createdAt": "..." }
  ],
  "latestId": "104"
}
```

Notes:
- **200 + empty list is success**, not failure
- `latestId` lets the client catch up even if it sent a stale cursor
- `Cache-Control: no-store` — you almost never want a CDN to cache “anything new?”

Creating data is a **normal POST**. Polling is only the read path:

```http
POST /messages
Content-Type: application/json

{ "author": "Ada", "text": "Ship it" }
```

The next poll (up to `interval` later) sees it.

---

## 5. Choosing the interval

The interval is a product decision wearing a technical costume.

```
perceived latency ≈ interval / 2   (on average)
worst latency     ≈ interval + network
```

| Interval | Feels like | Cost |
|---|---|---|
| 500ms | “live” | Brutal at scale |
| 2–5s | chat-adjacent | Common for toys / small tools |
| 15–30s | notifications | Email-like freshness |
| 1–5 min | dashboards | Often the right default |

Ask: “If this update is 10 seconds late, is the feature still correct?”  
If yes, poll. If no, you wanted long poll / SSE / WebSocket.

---

## 6. Load math (why seniors flinch)

`clients × (1 / interval) = QPS` of mostly-empty GETs.

- 10,000 clients × poll every 2s = **5,000 QPS** of “no”
- Each request still hits TLS, auth, routing, maybe DB

Mitigations (still polling):

- **ETag / If-None-Match** — 304 is cheaper than a JSON body, not cheaper than skipping the request
- **Backoff when idle** — stretch the interval after N empty polls
- **Jitter** — don’t let every mobile app wake on the same second
- **Shared worker / one tab polls** — 5 open tabs should not mean 5× QPS

None of these make polling “real-time.” They make polling **survivable**.

---

## 7. Errors

Treat poll failures like any GET:

- 401 → refresh auth, don’t tight-loop
- 429 / 5xx → exponential backoff + jitter
- Network drop → same backoff; keep the cursor
- Never reset the cursor to `0` on error (duplicates / missed events)

A good poller is boring: **cursor + timeout + backoff**.

---

## 8. Short polling vs the rest

### Short polling shines when:
- Delay of seconds is acceptable
- Events are infrequent
- You must stay on stateless HTTP
- The team is small and the client is simple

### Long polling is better when:
- You hate the empty answers but cannot open a WebSocket
- “Tell me the moment it exists” matters more than holding a connection

### WebSocket is better when:
- Both sides talk a lot
- Interval would have to be tiny to feel correct

### Still just click-to-GET when:
- The user is the clock (search, submit, refresh button)

---

## 9. Common mistakes

1. **`setInterval` that ignores in-flight requests**  
2. **Fetching `/messages` with no `after`**  
3. **Polling POST/mutation endpoints**  
4. **Caching the poll URL**  
5. **Calling it real-time** — it is *bounded delay*, not push  
6. **One interval for every environment** — local demo at 1s, production at 15s is normal

---

## 10. Full picture in one diagram

```text
┌────────────┐   every N ms    ┌────────────┐
│   Client   │ ──────────────► │   Server   │
│  (timer)   │  GET ?after=X   │ (answers   │
│            │ ◄────────────── │  immediately)
└────────────┘   [] or delta   └─────┬──────┘
                                     │
                               Message store
```

Your job when learning short polling:
1. Always poll a **delta**
2. Schedule the **next** poll after the current one ends
3. Budget QPS = clients / interval
4. Know when the interval itself is the wrong tool

---

## 11. Mini glossary

- **Poll**: one “anything new?” request
- **Interval**: sleep between polls
- **Cursor (`after`)**: resume point
- **Empty poll**: 200 with no new events — the common case
- **Jitter**: random extra delay so clients don’t sync up
- **Backoff**: slower retries after errors or long idle

---

## 12. What “good understanding” looks like

You understand short polling when you can answer:

1. Why does the server never wait?
2. Why is empty 200 the normal result?
3. How do you avoid overlapping polls?
4. What QPS do 50k clients at 5s create?
5. When would you stop polling and switch technique?

If those answers are clear, your mental model is solid.

---

## Next step

Open:
- `03-code-example/` and run the inbox
- Watch the **poll counter** stay high while the message list stays quiet
- Post one message and see it appear on the *next* tick — not instantly
