# REST Basics API (project-style)

Small REST service structured like a real codebase — not a single-file demo.

## Folder structure

```text
03-code-example/
├── package.json
├── README.md
└── src/
    ├── index.js                 # app entry
    ├── config/
    │   └── index.js             # port / env
    ├── db/
    │   ├── store.js             # in-memory data store
    │   └── seed.js              # seed data
    ├── server/
    │   └── createServer.js      # HTTP bootstrap
    ├── routes/
    │   └── index.js             # mount module routes
    └── modules/
        ├── user/
        │   ├── user.routes.js
        │   ├── user.controller.js
        │   └── user.service.js
        └── post/
            ├── post.routes.js
            ├── post.controller.js
            └── post.service.js
```

### Why this layout
- **modules/** — domain ownership (routes + controller + service)
- **routes/** — URL surface assembly only
- **db/** — data access / persistence boundary
- **server/** — transport bootstrap
- Controllers stay thin; services hold business rules

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

Base URL: [http://localhost:4001](http://localhost:4001)

(Uses port `4001` so it can run beside the GraphQL example on `4000`.)

---

## Requests to try

### 1) List users

```bash
curl http://localhost:4001/users
```

### 2) One user

```bash
curl http://localhost:4001/users/1
```

### 3) Nested relation via URL — user posts

```bash
curl http://localhost:4001/users/1/posts
```

### 4) Create post

```bash
curl -X POST http://localhost:4001/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"My first REST post","authorId":"1"}'
```

---

## Trace one request through the code

For `GET /users/1/posts`:

1. `src/routes/index.js` mounts `/users`
2. `src/modules/user/user.routes.js` matches `/:id/posts`
3. `user.controller.js` → `listPosts`
4. `post.service.js` filters posts by `authorId`

That path is the REST mental model in a real project shape.
