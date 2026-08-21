# XSS Comment Wall (encoded)

Small guestbook that treats comments as **data**. The page never concatenates user text into HTML.

## Folder structure

```text
03-code-example/
├── package.json
├── README.md
├── public/
│   ├── index.html           # markup only — scripts/styles are files (CSP)
│   ├── app.css
│   └── app.js               # textContent render path
└── src/
    ├── index.js
    ├── config/
    │   └── index.js
    ├── db/
    │   ├── store.js
    │   └── seed.js
    ├── server/
    │   └── createServer.js  # CSP + JSON API + static files
    ├── routes/
    │   └── index.js
    ├── security/
    │   └── escapeHtml.js    # output encoding helper
    └── modules/
        └── comment/
            ├── comment.routes.js
            ├── comment.controller.js
            └── comment.service.js
```

### Why this layout
- **modules/** — domain ownership (HTTP adapters + service)
- **security/** — encoding as an output step, not “filter on input”
- **db/** — comments stored as strings, never as pre-built HTML
- **public/app.js** — DOM built with `textContent` (the HTML-body fix)
- **CSP** — scripts/styles only from this origin; no inline JS

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

Open: [http://localhost:4021](http://localhost:4021)

---

## Requests to try

### 1) List comments

```bash
curl "http://localhost:4021/comments"
```

Each row includes `text` (raw data) and `escapedText` (HTML-body encoding). The browser still renders with `textContent`.

### 2) Post markup-looking text

```bash
curl -X POST http://localhost:4021/comments \
  -H "Content-Type: application/json" \
  -d '{"author":"Ada","text":"Angle brackets <like this> stay letters"}'
```

Reload the page. You should see the angle brackets **as characters**, plus an `escaped:` line showing `&lt;` / `&gt;`.

---

## Trace one comment through the code

1. `comment.service.js` saves `{ author, text }` — no HTML
2. `escapeHtml` adds `escapedText` for the debug line
3. `public/app.js` sets `body.textContent = comment.text`

That path is the XSS mental model: **data in the store, text in the DOM, CSP as a seatbelt**.
