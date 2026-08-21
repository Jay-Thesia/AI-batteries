# Communication Techniques Overview (project-style)

One inbox. Three delivery pipes. Watch the **counters**, not just the message list.

## Folder structure

```text
03-code-example/
├── package.json
├── README.md
├── public/index.html            # three-column comparison
└── src/
    ├── index.js
    ├── config/index.js
    ├── db/store.js
    ├── db/seed.js
    ├── server/createServer.js
    ├── routes/index.js          # /short /long /messages + POST
    ├── techniques/waiters.js    # long-poll parked responses
    ├── ws/attachWebSocket.js    # duplex frames
    └── modules/message/
        └── message.service.js   # shared domain
```

### Why this layout
- **One service** owns messages
- **Short poll** is a normal GET that returns immediately
- **Long poll** parks the GET until notify
- **WebSocket** upgrades the same HTTP server
- POST wakes long-poll waiters **and** broadcasts on the socket

## Run

```bash
cd 03-code-example
npm install
npm start
```

Open: [http://localhost:4010](http://localhost:4010)

Post a message and compare:

| Column | What jumps | What stays quiet |
|---|---|---|
| Short polling | HTTP request count every 2s | List (until the next tick) |
| Long polling | One wait finishes now | Request count when idle |
| WebSocket | One frame | No extra HTTP GET |

---

## Requests to try

```bash
# short poll (returns immediately, often empty)
curl "http://localhost:4010/short/messages?after=102"

# long poll (hangs until POST or ~20s timeout)
curl "http://localhost:4010/long/messages/wait?after=102"

# create — unblocks waiters and pushes to sockets
curl -X POST http://localhost:4010/messages \
  -H "Content-Type: application/json" \
  -d '{"author":"Ada","text":"One write, three deliveries"}'
```

---

## Trace one POST through the code

1. `POST /messages` → `message.service.js` saves the row
2. `waiterHub.notifyAll()` completes held long polls
3. `publishMessage()` writes a WebSocket frame
4. Short pollers only see it on their **next timer GET**

Same domain event. Three waiting strategies. That is the overview mental model.
