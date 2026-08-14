# GraphQL Blog — Full Mental Model

> Goal: after reading this, you should be able to *think* in GraphQL, not just copy queries.

---

## 1. What problem does GraphQL solve?

Apps need data from servers.

**REST** usually means many endpoints:
- `GET /users/1`
- `GET /users/1/posts`
- `GET /posts/5/comments`

Problems that show up often:
1. **Over-fetching** — you get more fields than you need
2. **Under-fetching** — one call is not enough, so you make more calls
3. **Endpoint sprawl** — every new screen wants a slightly different shape of data
4. **Frontend ↔ backend coupling** — UI changes often need new endpoints

**GraphQL** is a different contract:
- One endpoint (usually `/graphql`)
- Client sends a **query** describing the exact data shape
- Server returns JSON matching that shape

Mental shift:

| REST thinking | GraphQL thinking |
|---|---|
| “Which URL do I call?” | “What graph of data do I need?” |
| Resources + endpoints | Types + fields + relationships |
| Multiple round trips | One query, nested data |
| Fixed response shape | Client-chosen response shape |

---

## 2. Core mental model (keep this forever)

Think of your backend data as a **graph**:

```
User
 ├── id
 ├── name
 ├── email
 └── posts[]
      ├── id
      ├── title
      └── comments[]
           ├── id
           └── text
```

GraphQL lets the client walk this graph and pick fields.

A query is basically:

> “Start at this entry point, then follow these relationships, and return only these fields.”

That is the whole idea.

---

## 3. The three operations

### 1) Query — read data
Like GET, but with a custom shape.

```graphql
query {
  user(id: "1") {
    name
    posts {
      title
    }
  }
}
```

### 2) Mutation — change data
Like POST/PUT/PATCH/DELETE.

```graphql
mutation {
  createPost(title: "Hello", authorId: "1") {
    id
    title
  }
}
```

### 3) Subscription — live updates
Server pushes changes (often over WebSockets).

```graphql
subscription {
  messageAdded {
    id
    text
  }
}
```

Remember:
- **Query** = ask
- **Mutation** = change
- **Subscription** = listen

---

## 4. Schema = the contract

The **schema** is the source of truth. It defines:
- what types exist
- what fields each type has
- what arguments fields accept
- what clients are allowed to ask

Example schema (SDL = Schema Definition Language):

```graphql
type User {
  id: ID!
  name: String!
  email: String
  posts: [Post!]!
}

type Post {
  id: ID!
  title: String!
  author: User!
}

type Query {
  user(id: ID!): User
  posts: [Post!]!
}

type Mutation {
  createPost(title: String!, authorId: ID!): Post!
}
```

Symbols to memorize:
- `String`, `Int`, `Float`, `Boolean`, `ID` → scalar types
- `Type!` → non-null (must return a value)
- `[Type]` → list
- `[Type!]!` → list itself required, and items required

Mental model:
> If it’s not in the schema, the client cannot ask for it.

---

## 5. Resolvers = how fields get values

A query asks for fields.  
A **resolver** is the function that fetches/computes each field.

Simple picture:

```
Client query
   ↓
GraphQL engine checks schema
   ↓
Calls resolvers field by field
   ↓
Builds response object matching the query
```

Example:

```js
const resolvers = {
  Query: {
    user: (_, { id }) => db.users.find(id),
  },
  User: {
    posts: (user) => db.posts.byUser(user.id),
  },
};
```

Important insight:
- Parent resolver returns an object
- Child resolvers can use that parent object
- Nested queries = nested resolver calls

So GraphQL is not magic storage.  
It is a **query language + execution engine** over your existing data (DB, APIs, services).

---

## 6. One request, nested response

Request:

```graphql
{
  user(id: "1") {
    name
    posts {
      title
    }
  }
}
```

Response:

```json
{
  "data": {
    "user": {
      "name": "Ada",
      "posts": [
        { "title": "GraphQL basics" },
        { "title": "Why schemas matter" }
      ]
    }
  }
}
```

Notice:
- Query shape ≈ response shape
- That mirroring is a huge part of the mental model

---

## 7. How a GraphQL request actually travels

Typical HTTP flow:

1. Client sends `POST /graphql`
2. Body contains:
   - `query` (the GraphQL document)
   - `variables` (optional dynamic values)
   - `operationName` (optional, if multiple ops in one document)
3. Server:
   - parses query
   - validates against schema
   - executes resolvers
   - returns `{ data, errors? }`

Example with variables (best practice):

```graphql
query GetUser($id: ID!) {
  user(id: $id) {
    name
  }
}
```

```json
{
  "query": "query GetUser($id: ID!) { user(id: $id) { name } }",
  "variables": { "id": "1" }
}
```

Why variables?
- Safer than string concatenation
- Reusable queries
- Better caching / tooling

---

## 8. Errors mental model

In REST, errors often mean HTTP 404/500 and maybe no useful body.

In GraphQL:
- HTTP may still be `200`
- Business/field errors often live in `errors` array
- Partial data is possible (`data` + `errors` together)

Example:

```json
{
  "data": {
    "user": {
      "name": "Ada",
      "email": null
    }
  },
  "errors": [
    {
      "message": "Not authorized to view email",
      "path": ["user", "email"]
    }
  ]
}
```

Mental model:
> GraphQL separates transport success from field resolution success.

---

## 9. GraphQL vs REST (honest comparison)

### GraphQL shines when:
- UI needs flexible, nested data
- Mobile bandwidth matters (ask only needed fields)
- Many clients want different shapes from one API
- Rapid frontend iteration

### REST can be better when:
- Simple CRUD resources
- Strong HTTP caching with URLs is enough
- Team already has mature REST platform
- File uploads / streaming patterns are simpler in classic HTTP

Not religion. Choose per product constraints.

---

## 10. Common pitfalls (learn these early)

1. **N+1 problem**  
   Nested lists can trigger many DB calls. Fix with batching/dataloader patterns.

2. **Giant queries**  
   Clients can ask for huge nested trees. Add query depth/complexity limits.

3. **Auth mistakes**  
   Protect fields/resolvers, not only the endpoint.

4. **Thinking GraphQL replaces your DB**  
   It doesn’t. It sits above your data sources.

5. **Ignoring schema design**  
   Bad schema = painful API forever. Design types around domain meaning, not random UI screens.

---

## 11. Full picture in one diagram

```text
          ┌──────────────┐
          │   Client UI  │
          └──────┬───────┘
                 │  query / mutation
                 ▼
          ┌──────────────┐
          │ GraphQL API  │  ← schema (contract)
          │  (1 endpoint)│
          └──────┬───────┘
                 │ resolvers
        ┌────────┼────────┐
        ▼        ▼        ▼
      Database  REST     Services
```

Your job when learning GraphQL:
1. Understand the **graph**
2. Read/write the **schema**
3. Write **queries/mutations**
4. Understand **resolvers**
5. Know **tradeoffs**

---

## 12. Mini glossary

- **Schema**: what is possible
- **Type**: a node shape in the graph
- **Field**: a property you can ask for
- **Query/Mutation/Subscription**: operation kinds
- **Resolver**: function that resolves a field
- **SDL**: language used to declare schema
- **Document**: a GraphQL request string
- **Variables**: dynamic inputs to operations

---

## 13. What “good understanding” looks like

You understand GraphQL when you can answer:

1. Why can one endpoint serve many screens?
2. Why does query shape mirror response shape?
3. What is the schema protecting/enabling?
4. Where do resolvers fit?
5. When would you still choose REST?

If those answers are clear, your mental model is solid.

---

## Next step

Open:
- `03-code-example/` and run the tiny server
- Practice writing 3 queries by hand before using any fancy client library
