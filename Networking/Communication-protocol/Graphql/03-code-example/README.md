# GraphQL Basics API (project-style)

Small GraphQL service structured like a real codebase — not a single-file demo.

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
    ├── graphql/
    │   ├── root.typeDefs.js     # Query / Mutation roots
    │   ├── typeDefs.js          # combine schemas
    │   ├── resolvers.js         # combine resolvers
    │   └── schema.js            # ApolloServer factory
    └── modules/
        ├── user/
        │   ├── user.typeDefs.js
        │   ├── user.resolvers.js
        │   └── user.service.js
        └── post/
            ├── post.typeDefs.js
            ├── post.resolvers.js
            └── post.service.js
```

### Why this layout
- **modules/** — domain ownership (types + resolvers + service)
- **graphql/** — schema assembly only
- **db/** — data access / persistence boundary
- **server/** — transport bootstrap
- Resolvers stay thin; services hold business rules

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

Open: [http://localhost:4000](http://localhost:4000)

---

## Operations to try

### 1) List users

```graphql
query {
  users {
    id
    name
  }
}
```

### 2) Nested user + posts

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

### 3) Create post

```graphql
mutation {
  createPost(title: "My first GraphQL post", authorId: "1") {
    id
    title
    author {
      name
    }
  }
}
```

### 4) Variables

```graphql
query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
    email
  }
}
```

```json
{
  "id": "1"
}
```

---

## Trace one request through the code

For `user(id: "1") { name posts { title } }`:

1. `src/graphql/root.typeDefs.js` declares `user`
2. `src/modules/user/user.resolvers.js` → `Query.user`
3. `user.service.js` loads the user
4. nested `posts` → `User.posts` resolver
5. `post.service.js` filters posts by `authorId`

That path is the GraphQL mental model in a real project shape.
