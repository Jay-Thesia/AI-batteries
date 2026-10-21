# gRPC Blog — Full Mental Model

> Goal: after reading this, you should be able to *think* in gRPC — contracts, RPC kinds, Protobuf, and when it beats REST/GraphQL.

---

## 1. What problem does gRPC solve?

Microservices and internal APIs often need:
- **Strong contracts** between languages (Go ↔ Node ↔ Java ↔ Python)
- **Low latency / smaller payloads** than verbose JSON
- **Streaming** (not just request → one response)
- **Code generation** so clients don’t hand-roll HTTP calls

**gRPC** (Google Remote Procedure Call) is a modern RPC framework:
- Contract defined in **Protocol Buffers** (`.proto`)
- Transport usually **HTTP/2**
- Payload usually **Protobuf** (binary, typed)
- Client stubs make remote calls feel like local function calls

Typical surface (conceptual):

```text
service UserService {
  rpc GetUser (GetUserRequest) returns (User);
  rpc ListUsers (ListUsersRequest) returns (ListUsersResponse);
  rpc CreatePost (CreatePostRequest) returns (Post);
}
```

You don’t primarily think “which URL?”  
You think “which **procedure** do I call, with which **message**?”

Mental shift:

| REST thinking | GraphQL thinking | gRPC thinking |
|---|---|---|
| “Which URL + verb?” | “What graph shape do I need?” | “Which function do I call?” |
| Resources + HTTP methods | Types + fields + queries | Services + RPCs + messages |
| JSON over HTTP/1.1 (often) | Query language over HTTP | Protobuf over HTTP/2 |
| Fixed endpoint shapes | Client-chosen shapes | Fixed method signatures |
| One request → one response | One query → one JSON tree | Unary **or** streams |

---

## 2. Core mental model (keep this forever)

Think of your backend as a set of **services** that expose **remote methods**:

```text
BlogService
 ├── GetUser(id) -> User
 ├── ListUsers() -> User[]
 ├── ListPostsByUser(userId) -> Post[]
 └── CreatePost(title, authorId) -> Post
```

gRPC lets the client:
1. Import generated stubs (or load a `.proto`)
2. Call a method with a typed request message
3. Receive a typed response (or a stream of responses)

A call is basically:

> “Invoke this RPC on that service, send this request message, get back the agreed response type.”

That is the whole idea.

---

## 3. The four RPC kinds

This is the part that makes gRPC feel bigger than “JSON APIs with binary.”

### 1) Unary — one request, one response
Like a normal function call. Closest to `GET`/`POST` REST.

```protobuf
rpc GetUser (GetUserRequest) returns (User);
```

### 2) Server streaming — one request, many responses
Server keeps sending messages until done.

```protobuf
rpc ListPostUpdates (ListPostsRequest) returns (stream Post);
```

Useful for: live feeds, large result sets chunked over time, progress events.

### 3) Client streaming — many requests, one response
Client sends a stream; server replies once at the end.

```protobuf
rpc UploadMetrics (stream Metric) returns (UploadSummary);
```

Useful for: uploads, batching telemetry, client-side aggregation.

### 4) Bidirectional streaming — both sides stream
Either side can send anytime (within the call).

```protobuf
rpc Chat (stream ChatMessage) returns (stream ChatMessage);
```

Useful for: chat, collaborative edits, multiplexed interactive protocols.

Remember:
- **Unary** = call
- **Server stream** = listen to many replies
- **Client stream** = send many, get one summary
- **Bidi stream** = conversation

---

## 4. `.proto` = the contract

In gRPC, the **`.proto` file** is the source of truth. It defines:
- `package` / service names
- RPC methods
- request/response message types
- field numbers and types

Example:

```protobuf
syntax = "proto3";

package blog.v1;

service BlogService {
  rpc GetUser (GetUserRequest) returns (User);
  rpc ListUsers (ListUsersRequest) returns (ListUsersResponse);
  rpc ListPostsByUser (ListPostsByUserRequest) returns (ListPostsByUserResponse);
  rpc CreatePost (CreatePostRequest) returns (Post);
}

message User {
  string id = 1;
  string name = 2;
  string email = 3;
}

message Post {
  string id = 1;
  string title = 2;
  string author_id = 3;
}

message GetUserRequest {
  string id = 1;
}

message ListUsersRequest {}

message ListUsersResponse {
  repeated User users = 1;
}

message ListPostsByUserRequest {
  string user_id = 1;
}

message ListPostsByUserResponse {
  repeated Post posts = 1;
}

message CreatePostRequest {
  string title = 1;
  string author_id = 2;
}
```

Symbols / ideas to memorize:
- `message` → typed struct
- `rpc` → remote method
- `repeated` → list/array
- `stream` → streaming on that side
- Field numbers (`= 1`, `= 2`) are identity for binary encoding — **don’t renumber casually**
- `proto3` is the common modern syntax

Mental model:
> If it’s not in the `.proto`, generated clients can’t call it (cleanly). The proto is the shared product contract across languages.

---

## 5. Protobuf — why not just JSON?

**Protocol Buffers** serialize structured data into a compact binary format.

Why teams use it with gRPC:
1. **Smaller payloads** than typical JSON
2. **Faster encode/decode** in many workloads
3. **Schema-first** evolution (add fields carefully; reserve removed numbers)
4. **Codegen** for many languages from one file

Important insight:
- gRPC is the RPC framework + transport conventions
- Protobuf is the common IDL + serialization
- You *can* use other payloads, but Protobuf + gRPC is the default mental model

JSON is human-readable. Protobuf is machine-efficient.  
Pick based on audience: browser public APIs often stay JSON/REST or GraphQL; service-to-service often loves gRPC.

---

## 6. Handlers / implementations = how RPCs get values

A client calls an RPC.  
A **service implementation** (handler) runs on the server, talks to your domain services/DB, and returns a response message (or writes to a stream).

Simple picture:

```text
Client stub call
   ↓
HTTP/2 + gRPC framing
   ↓
Server deserializes Protobuf request
   ↓
Your handler / service method runs
   ↓
Serialize Protobuf response
   ↓
Client receives typed object
```

Example (Node-style mental model):

```js
const blogService = {
  getUser(call, callback) {
    const user = userService.findById(call.request.id);
    if (!user) {
      return callback({ code: grpc.status.NOT_FOUND, message: "User not found" });
    }
    return callback(null, user);
  },
};
```

Important insight:
- Proto defines the public surface
- Handlers stay thin adapters
- Domain services hold business rules
- Persistence stays behind services

So gRPC is not a database.  
It is a **typed RPC layer** over your existing logic.

---

## 7. One call, typed response (unary)

Request message:

```text
GetUserRequest { id: "1" }
```

Response message:

```text
User { id: "1", name: "Ada", email: "ada@example.com" }
```

Related data is usually another RPC (unless you design a richer response message):

```text
ListPostsByUserRequest { user_id: "1" }
→ ListPostsByUserResponse { posts: [...] }
```

Notice:
- Method signature is fixed by the contract
- Nesting is designed into messages / extra RPCs, not free-form client queries
- That tradeoff (strict contract vs flexible query) is central when comparing to GraphQL

---

## 8. How a gRPC call actually travels

Typical flow:

1. Client creates a channel to `host:port` (often `localhost:50051`)
2. Client stub calls `BlogService.GetUser({ id: "1" })`
3. Libraries:
   - encode request with Protobuf
   - send over HTTP/2 (multiplexed streams, binary framing)
4. Server:
   - routes to the service/method
   - runs your handler
   - returns status + response message (or stream messages)
5. Client stub decodes into language objects

Deadlines / metadata matter in real systems:
- **Deadline**: “fail this call if not done by T”
- **Metadata**: headers-like key/values (auth tokens, trace ids, locale)

Why HTTP/2 matters:
- Multiplexing many RPCs on one connection
- Header compression
- Native streaming support
- Better fit for chatty service meshes than naive HTTP/1.1 request storms

---

## 9. Errors mental model

gRPC uses rich **status codes** (not primarily HTTP 404/500 as the app contract, though HTTP/2 is underneath).

Common codes:
- `OK`
- `INVALID_ARGUMENT` (bad input)
- `NOT_FOUND`
- `ALREADY_EXISTS`
- `PERMISSION_DENIED`
- `UNAUTHENTICATED`
- `RESOURCE_EXHAUSTED`
- `FAILED_PRECONDITION`
- `UNAVAILABLE`
- `DEADLINE_EXCEEDED`
- `INTERNAL`

Example mental model:

```text
callback({
  code: grpc.status.NOT_FOUND,
  message: "User not found",
})
```

Compared to REST:
- REST: HTTP status is the main outcome signal
- gRPC: gRPC status code (+ optional details) is the main outcome signal

Compared to GraphQL:
- GraphQL: often HTTP 200 + `errors[]` in body
- gRPC: failed RPC is a failed status on that call

---

## 10. Code generation vs dynamic loading

Two common developer experiences:

### A) Codegen (classic gRPC)
1. Write `.proto`
2. Run `protoc` / buf plugins
3. Import generated server interfaces + client stubs
4. Implement methods

Pros: strong types, great IDE support, multi-language standard.

### B) Runtime proto loading (handy in Node demos)
1. Write `.proto`
2. Load with `@grpc/proto-loader`
3. Serve/implement dynamically

Pros: fast to learn/demo.  
Cons: less compile-time safety than generated stubs.

Mental model:
> Either way, the `.proto` remains the contract. Codegen just makes that contract feel native in each language.

---

## 11. gRPC vs REST vs GraphQL (honest comparison)

### gRPC shines when:
- Service-to-service communication inside a platform
- Polyglot teams need one contract across languages
- You want strong typing + codegen
- Streaming matters (logs, events, interactive flows)
- Payload size / latency matter at scale
- You control both client and server (or generate clients)

### REST can be better when:
- Public browser-facing HTTP APIs
- Human-debuggable JSON over plain HTTP is a feature
- CDN / URL caching is central
- Broad ecosystem of HTTP tools is enough

### GraphQL can be better when:
- Many clients need different nested slices of one domain graph
- Frontend iteration depends on flexible queries
- Over-fetching / under-fetching is the main pain

Rough default:
- **External product API / browsers** → REST or GraphQL
- **Internal microservice mesh** → gRPC often wins
- **Flexible BFF / multi-client product graph** → GraphQL often wins

Not religion. Choose per boundary.

---

## 12. Common pitfalls (learn these early)

1. **Treating gRPC as “REST with Protobuf”**  
   You miss streaming, deadlines, status model, and service-oriented design.

2. **Breaking wire compatibility**  
   Renaming is usually fine; reusing/changing field numbers is not. Add fields; don’t repurpose numbers.

3. **No deadlines**  
   Hung downstream calls cascade. Always think timeouts/deadlines in production.

4. **Giant unbounded server streams**  
   Streaming is powerful; still need backpressure, auth, and abuse limits.

5. **Browser story surprise**  
   Browsers don’t speak raw gRPC the same way native clients do. People use **gRPC-Web** (or a gateway) for browser apps.

6. **Auth only “at the load balancer”**  
   Still enforce per-method authorization in handlers/services.

7. **Chatty unary designs that should stream (or vice versa)**  
   Match RPC kind to the communication pattern.

---

## 13. Full picture in one diagram

```text
          ┌────────────────┐
          │  Client app /  │
          │  other service │
          └───────┬────────┘
                  │ stub: GetUser({id})
                  ▼
          ┌────────────────┐
          │  gRPC channel  │  ← Protobuf messages
          │   (HTTP/2)     │
          └───────┬────────┘
                  │
          ┌────────────────┐
          │ gRPC server    │  ← .proto = contract
          │ BlogService    │
          └───────┬────────┘
                  │ handlers → domain services
         ┌────────┼────────┐
         ▼        ▼        ▼
       Database  Cache   Other gRPC APIs
```

Your job when learning gRPC:
1. Understand **RPC-as-function** thinking
2. Read/write **`.proto` contracts**
3. Know the **four RPC kinds**
4. Implement **handlers** over domain services
5. Understand **status/deadlines/streaming tradeoffs**
6. Know **when REST/GraphQL still win**

---

## 14. Mini glossary

- **RPC**: Remote Procedure Call — call a function on another machine
- **`.proto` / Protobuf IDL**: contract language for services + messages
- **Message**: typed request/response struct
- **Service**: named group of RPCs
- **Stub / client**: generated (or loaded) helper that calls RPCs
- **Channel**: connection abstraction to a server
- **Unary**: one request, one response
- **Stream**: sequence of messages on one RPC
- **Metadata**: key/value pairs sent with a call (like headers)
- **Deadline**: when the client wants the call to have finished
- **Status code**: canonical gRPC outcome
- **gRPC-Web**: browser-oriented variant/proxy path for gRPC
- **Codegen**: generating language types/stubs from `.proto`

---

## 15. What “good understanding” looks like

You understand gRPC when you can answer:

1. Why is the `.proto` the product contract?
2. How is an RPC different from a REST resource URL?
3. When do you choose unary vs server streaming?
4. Why do field numbers matter in Protobuf?
5. How are errors modeled differently from REST/GraphQL?
6. When would you still choose REST or GraphQL instead?

If those answers are clear, your mental model is solid.

---

## Next step

Open:
- `03-code-example/` and run the tiny server
- Run the sample client script (or `grpcurl`) for all unary RPCs
- Skim the `.proto` first — that’s the whole API
