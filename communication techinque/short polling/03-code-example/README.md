# Short Polling Inbox (project-style)

Small inbox that the client **asks on a timer**. The server never holds the request.

## Folder structure

```text
03-code-example/
├── package.json
├── README.md
├── public/index.html            # browser poller + counters
└── src/
    ├── index.js                 # app entry
    ├── config/
    │   └── index.js             # port / poll interval
    ├── db/
    │   ├── store.js             # in-memory data store
    │   └── seed.js              # seed data
    ├── server/
    │   └── createServer.js      # HTTP bootstrap
    ├── routes/
    │   └── index.js             # mount module routes
    └── modules/
        └── message/
            ├── message.routes.js
            ├── message.controller.js
            └── message.service.js
```

### Why this layout
- **modules/** — domain ownership (routes + controller + service)
- **routes/** — URL surface assembly only
- **db/** — data access / persistence boundary
- **server/** — transport bootstrap
- Controllers stay thin; services hold business rules
- The **timer lives in the browser**, not on the server

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

Open: [http://localhost:4011](http://localhost:4011)

Watch **Polls** climb while **Empty polls** stays almost in lockstep until you post.

---

## Requests to try

### 1) List (immediate — may be a full snapshot)

```bash
curl "http://localhost:4011/messages"
```

### 2) Poll a delta (the real short-poll shape)

```bash
curl "http://localhost:4011/messages?after=102"
```

### 3) Create a message

```bash
curl -X POST http://localhost:4011/messages \
  -H "Content-Type: application/json" \
  -d '{"author":"Ada","text":"Hello from curl"}'
```

Then repeat request 2 — the new row appears **on the next poll**, not by magic.

---

## Trace one poll through the code

For `GET /messages?after=102`:

1. `src/routes/index.js` mounts `/messages`
2. `message.routes.js` matches `GET /`
3. `message.controller.js` → `list`
4. `message.service.js` returns only messages **after** the cursor

That path is short polling: **ask now, answer now, sleep on the client**.
