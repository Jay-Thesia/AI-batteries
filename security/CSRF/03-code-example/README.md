# CSRF Account Email (token required)

Small settings page: a **session cookie** says who you are; a **CSRF token** says this page meant the write.

## Folder structure

```text
03-code-example/
├── package.json
├── README.md
├── public/
│   ├── index.html
│   ├── app.css
│   └── app.js               # sends X-CSRF-Token on email change
└── src/
    ├── index.js
    ├── config/
    │   └── index.js
    ├── db/
    │   ├── store.js
    │   └── seed.js
    ├── server/
    │   └── createServer.js
    ├── routes/
    │   └── index.js
    ├── security/
    │   ├── cookies.js       # Cookie header parse / Set-Cookie
    │   └── session.js       # sid cookie + synchronizer token
    └── modules/
        └── account/
            ├── account.routes.js
            ├── account.controller.js
            └── account.service.js
```

### Why this layout
- **modules/** — domain (login + email)
- **security/session.js** — cookie = identity, token = intent
- **sid** is `HttpOnly` + `SameSite=Lax` — JS cannot read it; most cross-site POSTs will not send it
- Writes to `POST /email` fail without `X-CSRF-Token`

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

Open: [http://localhost:4022](http://localhost:4022)

Log in as **Ada**. Change email with the token. Then use “Try POST /email without token” — expect **403**.

---

## Requests to try

### 1) Login (sets `sid`)

```bash
curl -c cookies.txt -X POST http://localhost:4022/login \
  -H "Content-Type: application/json" \
  -d '{"name":"Ada"}'
```

Save the `csrfToken` from the JSON.

### 2) Cookie only — should fail

```bash
curl -b cookies.txt -X POST http://localhost:4022/email \
  -H "Content-Type: application/json" \
  -d '{"email":"rejected@example.com"}'
```

Expect `403` — identity without intent.

### 3) Cookie + token — should succeed

Replace `YOUR_TOKEN` with the value from step 1:

```bash
curl -b cookies.txt -X POST http://localhost:4022/email \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: YOUR_TOKEN" \
  -d '{"email":"ada+safe@example.com"}'
```

---

## Trace one email change through the code

1. `sid` cookie → `getSession` (who)
2. `requireCsrf` compares `X-CSRF-Token` to `session.csrfToken` (intent)
3. `userService.updateEmail` runs only if both pass

That path is the CSRF mental model: **cookie answers who; token answers “did our UI mean it.”**
