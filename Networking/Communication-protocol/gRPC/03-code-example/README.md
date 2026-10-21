# gRPC Basics API (project-style)

Small gRPC service structured like a real codebase — not a single-file demo.

## Folder structure

```text
03-code-example/
├── package.json
├── README.md
├── proto/
│   └── blog.proto                 # contract (source of truth)
└── src/
    ├── index.js                   # server entry
    ├── client.js                  # sample client script
    ├── config/
    │   └── index.js               # port / env
    ├── db/
    │   ├── store.js               # in-memory data store
    │   └── seed.js                # seed data
    ├── grpc/
    │   ├── loadProto.js           # load .proto at runtime
    │   └── createServer.js        # gRPC server bootstrap
    └── modules/
        ├── user/
        │   └── user.service.js
        └── post/
            └── post.service.js
```

### Why this layout
- **proto/** — shared contract (what REST routes / GraphQL schema are elsewhere)
- **modules/** — domain services
- **grpc/** — transport bootstrap + proto loading
- **db/** — data access / persistence boundary
- Handlers stay thin; services hold business rules

## Run

Terminal 1 — start server:

```bash
cd 03-code-example
npm install
npm start
```

Terminal 2 — run sample client:

```bash
npm run client
```

Server listens on `localhost:50051` (classic gRPC port; keeps `4000`/`4001` free for GraphQL/REST demos).

---

## RPCs to try (via `npm run client`)

1. `ListUsers`
2. `GetUser`
3. `ListPostsByUser`
4. `CreatePost`

Optional with [grpcurl](https://github.com/fullstorydev/grpcurl) if installed:

```bash
grpcurl -plaintext localhost:50051 list
grpcurl -plaintext localhost:50051 describe blog.v1.BlogService
grpcurl -plaintext -d '{"id":"1"}' localhost:50051 blog.v1.BlogService/GetUser
```

---

## Trace one call through the code

For `GetUser({ id: "1" })`:

1. `proto/blog.proto` declares `rpc GetUser`
2. `src/grpc/createServer.js` wires `GetUser` handler
3. handler calls `user.service.js`
4. response message matches the `User` message in the proto

That path is the gRPC mental model in a real project shape.
