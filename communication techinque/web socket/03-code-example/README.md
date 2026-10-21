# WebSocket Inbox (project-style)

Small inbox over a **duplex socket**. HTTP still exists for snapshots and curl-friendly posts.

## Folder structure

```text
03-code-example/
├── package.json
├── README.md
├── public/index.html            # browser client (two tabs!)
└── src/
    ├── index.js                 # app entry
    ├── config/
    │   └── index.js             # port / heartbeat
    ├── db/
    │   ├── store.js             # in-memory data store
    │   └── seed.js              # seed data
    ├── server/
    │   └── createServer.js      # HTTP + WS bootstrap
    ├── routes/
    │   └── index.js             # mount module routes
    ├── ws/
    │   └── attachWebSocket.js   # upgrade + frame protocol
    └── modules/
        └── message/
            ├── message.routes.js
            ├── message.controller.js
            └── message.service.js
```

### Why this layout
- **modules/** — domain ownership (HTTP adapters + service)
- **ws/** — transport adapter (frames, heartbeat, broadcast)
- **routes/** — URL surface assembly only
- **db/** — data access / persistence boundary
- **server/** — shared HTTP server so `/ws` can upgrade
- Both POST and `{ "type": "send" }` call the **same service**

## Run

```bash
cd 03-code-example
npm install
npm start
```

Optional watch mode:

```bash
npm run dev
```

Open: [http://localhost:4013](http://localhost:4013)

Open a **second tab** to the same URL and send a message.

---

## Requests to try

### 1) HTTP snapshot (catch-up)

```bash
curl "http://localhost:4013/messages"
```

### 2) HTTP post — broadcasts to every socket

```bash
curl -X POST http://localhost:4013/messages \
  -H "Content-Type: application/json" \
  -d '{"author":"Ada","text":"Hello from curl"}'
```

Watch the browser tab(s) update without polling.

### 3) Frame protocol (from the page)

```json
{ "type": "catchup", "lastId": "102" }
{ "type": "send", "author": "Ada", "text": "hi" }
```

Server frames:

```json
{ "type": "hello", "latestId": "102" }
{ "type": "snapshot", "messages": [ ... ], "latestId": "102" }
{ "type": "message", "message": { "id": "103", "text": "hi" } }
{ "type": "error", "message": "text is required" }
```

---

## Trace one send through the code

For a browser `{ "type": "send" }`:

1. `src/ws/attachWebSocket.js` parses the frame
2. `message.service.js` saves the row
3. `broadcast` writes `{ type: "message" }` to every open socket

For `POST /messages`, steps 2–3 are the same — only the adapter changes.

That path is the WebSocket mental model: **pipe + typed messages + shared domain service**.
