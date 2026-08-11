# REST Blog — Full Mental Model

> Goal: after reading this, you should be able to *think* in REST, not just memorize endpoints.

---

## 1. What problem does REST solve?

Apps need a clear, predictable way for clients to talk to servers.

**REST** (Representational State Transfer) is an architectural style for APIs, usually over HTTP:

- Identify **resources** with URLs
- Use **HTTP methods** for actions
- Exchange **representations** (usually JSON)
- Rely on **stateless** requests (each call carries what it needs)

Typical REST surface:

- `GET /users/1`
- `GET /users/1/posts`
- `POST /posts`
- `PATCH /posts/5`
- `DELETE /posts/5`

Problems REST handles well:
1. **Clear ownership** — each URL maps to a resource or collection
2. **HTTP semantics** — status codes, caching, verbs everyone already knows
3. **Simple tooling** — curl, browsers, CDNs, API gateways speak HTTP natively
4. **Predictable contracts** — clients know what each endpoint returns

Mental shift:

| Ad-hoc HTTP thinking | REST thinking |
|---|---|
| “Random URLs + actions” | “Resources + standard verbs” |
| RPC-style `/getUserPosts` | Nouns: `/users/1/posts` |
| Custom success/error shapes | Status codes + body conventions |
| Server remembers session state | Each request is self-contained |

---

## 2. Core mental model (keep this forever)

Think of your backend as a set of **resources**:

```
/users
/users/{id}
/users/{id}/posts
/posts
/posts/{id}
```

REST lets the client:
1. Point at a resource (URL)
2. Say what to do (method)
3. Receive a representation (JSON body + status)

A request is basically:

> “Act on this resource, using this verb, with this optional body — and tell me the result with HTTP status + JSON.”

That is the whole idea.

---

## 3. The HTTP verbs (CRUD mapping)

### GET — read
Safe and idempotent. Fetch a resource or collection.

```http
GET /users/1
```

### POST — create (or trigger an action)
Usually creates under a collection.

```http
POST /posts
Content-Type: application/json

{ "title": "Hello", "authorId": "1" }
```

### PUT — replace
Replace the whole resource. Idempotent.

```http
PUT /posts/5
```

### PATCH — partial update
Change only some fields.

```http
PATCH /posts/5
{ "title": "Updated title" }
```

### DELETE — remove
Idempotent. Delete the resource.

```http
DELETE /posts/5
```

Remember:
- **GET** = ask
- **POST** = create / do
- **PUT/PATCH** = change
- **DELETE** = remove

---

## 4. Resources + URLs = the contract

In REST, the **URL structure + method + response shape** is the contract.

Good resource design:
- Prefer **nouns**, not verbs: `/users`, not `/getUsers`
- Collections: `/posts`
- Members: `/posts/101`
- Nested relations when ownership is clear: `/users/1/posts`

Example contract:

| Method | Path | Meaning | Typical status |
|---|---|---|---|
| GET | `/users` | list users | 200 |
| GET | `/users/:id` | one user | 200 / 404 |
| GET | `/users/:id/posts` | posts by user | 200 |
| POST | `/posts` | create post | 201 |
| PATCH | `/posts/:id` | update post | 200 |
| DELETE | `/posts/:id` | delete post | 204 / 200 |

Mental model:
> If the resource isn’t addressable and the verb isn’t clear, the API is harder to learn.

---

## 5. Controllers / handlers = how requests become responses

A client hits a route.  
A **handler** (controller) validates input, calls a service, and writes the HTTP response.

Simple picture:

```
Client request
   ↓
Router matches method + path
   ↓
Controller / handler runs
   ↓
Service talks to DB / other APIs
   ↓
Response: status code + JSON body
```

Example:

```js
app.get("/users/:id", (req, res) => {
  const user = userService.findById(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.status(200).json(user);
});
```

Important insight:
- Routes declare the public surface
- Controllers stay thin
- Services hold business rules
- Persistence stays behind the service boundary

So REST is not “Express magic.”  
It is **resource-oriented HTTP** over your existing data.

---

## 6. One request, fixed response shape

Request:

```http
GET /users/1
```

Response:

```json
{
  "id": "1",
  "name": "Ada",
  "email": "ada@example.com"
}
```

Related data often needs another call:

```http
GET /users/1/posts
```

```json
[
  { "id": "101", "title": "Hello REST", "authorId": "1" },
  { "id": "102", "title": "Resources first", "authorId": "1" }
]
```

Notice:
- Each endpoint owns a fixed shape
- Nesting across resources usually means more round trips (or dedicated aggregate endpoints)
- That tradeoff is central to REST thinking

---

## 7. How a REST request actually travels

Typical HTTP flow:

1. Client sends `METHOD /path`
2. Headers include content type, auth, accept, cache hints
3. Optional JSON body for write operations
4. Server:
   - matches route
   - authenticates / authorizes
   - validates input
   - runs business logic
   - returns status + body

Example create:

```http
POST /posts HTTP/1.1
Host: localhost:4001
Content-Type: application/json

{
  "title": "My first REST post",
  "authorId": "1"
}
```

```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": "104",
  "title": "My first REST post",
  "authorId": "1"
}
```

Why status codes matter:
- Clients branch on meaning, not only body text
- Proxies/CDNs/monitoring understand them
- They are part of the public contract

---

## 8. Errors mental model

In REST, transport + business outcome usually share HTTP status:

- `200` OK
- `201` Created
- `204` No Content
- `400` Bad Request (client sent invalid input)
- `401` Unauthorized
- `403` Forbidden
- `404` Not Found
- `409` Conflict
- `500` Server error

Example:

```json
{
  "error": "User not found",
  "code": "USER_NOT_FOUND"
}
```

with `404`.

Mental model:
> REST usually couples “did this operation succeed?” to the HTTP status line.

(GraphQL often keeps HTTP 200 and puts field errors in the body — different contract style.)

---

## 9. REST vs GraphQL (honest comparison)

### REST shines when:
- Resources are naturally CRUD-shaped
- URL-level caching / CDNs matter
- Public APIs benefit from simple, guessable paths
- Team wants boring, standard HTTP tooling
- Each screen can live with a few round trips or dedicated endpoints

### GraphQL can be better when:
- Many clients need different nested shapes
- Over-fetching / under-fetching is a real product pain
- Frontend iteration speed depends on flexible queries
- One domain graph serves web + mobile + partners

Not religion. Choose per product constraints.

---

## 10. Common pitfalls (learn these early)

1. **RPC dressed as REST**  
   `/doCreateUserAndSendEmail` is an action URL, not a resource model. Prefer nouns + verbs (or explicit action resources carefully).

2. **Chatty APIs**  
   Too many tiny endpoints force waterfall requests. Add carefully designed aggregate endpoints when screens need them.

3. **Inconsistent status codes**  
   Returning `200` for every failure breaks clients and observability.

4. **Leaking DB shape as API shape**  
   Your public resource model can differ from tables. Design for consumers.

5. **Ignoring versioning / compatibility**  
   Breaking response fields without a plan hurts every client at once.

6. **Auth only at the edge**  
   Still enforce permissions per resource/action, not “logged in = can do everything.”

---

## 11. Full picture in one diagram

```text
          ┌──────────────┐
          │   Client UI  │
          └──────┬───────┘
                 │  GET/POST/PATCH/DELETE
                 ▼
          ┌──────────────┐
          │  REST API    │  ← routes = public contract
          │ (many URLs)  │
          └──────┬───────┘
                 │ controllers → services
        ┌────────┼────────┐
        ▼        ▼        ▼
      Database  Cache    Services
```

Your job when learning REST:
1. Understand **resources**
2. Design clean **URLs + verbs**
3. Use **status codes** intentionally
4. Keep **handlers thin, services clear**
5. Know **tradeoffs vs GraphQL**

---

## 12. Mini glossary

- **Resource**: a thing the API exposes (user, post, order)
- **Representation**: the JSON (or XML) form of that resource
- **Collection / member**: `/posts` vs `/posts/101`
- **Idempotent**: repeating the request has the same effect (GET, PUT, DELETE)
- **Safe**: request should not change server state (GET)
- **Stateless**: server doesn’t rely on prior request memory for correctness
- **Status code**: machine-readable outcome of the request
- **HATEOAS** (advanced): responses include links to related actions/resources

---

## 13. What “good understanding” looks like

You understand REST when you can answer:

1. Why do we model nouns (resources) instead of random action URLs?
2. What does each HTTP verb promise?
3. Why are status codes part of the contract?
4. When do multiple round trips become a problem — and how do you ease that without abandoning REST?
5. When would you still choose GraphQL?

If those answers are clear, your mental model is solid.

---

## Next step

Open:
- `03-code-example/` and run the tiny server
- Practice the 4 sample requests with curl before reaching for a GUI client
