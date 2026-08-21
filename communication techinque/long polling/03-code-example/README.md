# Long Polling Inbox (project-style)

Small inbox that **holds** `GET /messages/wait` until a new message exists or a timeout fires.

## Folder structure

```text
03-code-example/
├── package.json
├── README.md
├── public/index.html            # browser waiter + counters
└── src/
    ├── index.js                 # app entry
    ├── config/
    │   └── index.js             # port / wait timeout
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
            ├── message.service.js
            └── waiters.js       # parked HTTP responses
```

### Why this layout
- **modules/** — domain ownership (routes + controller + service)
- **waiters.js** — the long-poll mechanism (not domain rules)
- **routes/** — URL surface assembly only
- **db/** — data access / persistence boundary
- **server/** — transport bootstrap
- The **wait lives on the server**; the client retries immediately after each response

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

Open: [http://localhost:4012](http://localhost:4012)

Leave the tab sitting on “waiting…”, then post a message. The wait should finish **immediately**.

---

## Requests to try

Use two terminals so you can feel the hold.

### 1) Start a wait (this hangs)

```bash
curl "http://localhost:4012/messages/wait?after=102"
```

### 2) In another terminal, create a message

```bash
curl -X POST http://localhost:4012/messages \
  -H "Content-Type: application/json" \
  -d '{"author":"Ada","text":"Unblock the waiter"}'
```

Terminal 1 should print the new message and exit.

### 3) Immediate snapshot (not a wait)

```bash
curl "http://localhost:4012/messages"
```

### 4) Timeout empty

Start a wait and do nothing. After ~20s you get `{ "messages": [] }` — that is **success**, then the demo client waits again.

---

## Trace one wait through the code

For `GET /messages/wait?after=102`:

1. `message.routes.js` matches `GET /wait`
2. `waiters.js` checks the store **before** parking (no lost events in the gap)
3. If empty, the response is held and a timeout is armed
4. `POST /messages` → `message.service.js` saves → `waiterHub.notifyAll()`
5. The parked response completes with the delta

That path is long polling: **one HTTP request, late on purpose**.
