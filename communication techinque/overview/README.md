# Communication Techniques Learning Pack

All material for comparing **how clients stay up to date with a server** lives in this folder.

This is not GraphQL, REST, or gRPC. Those are **API contracts**. These are **delivery patterns** you can put under any contract.

| File | What it is |
|---|---|
| [00-nutshell-for-a-5-year-old.md](./00-nutshell-for-a-5-year-old.md) | Ultra-simple explanation |
| [01-blog-full-mental-model.md](./01-blog-full-mental-model.md) | Full blog + mental model |
| [02-linkedin-post.md](./02-linkedin-post.md) | Ready-to-post LinkedIn text |
| [03-code-example/](./03-code-example/) | Tiny runnable comparison of all three techniques |

## Suggested learning order (30–45 min)

1. Read the 5-year-old nutshell (2 min)
2. Read the mental-model blog (15–20 min)
3. Run the comparison demo and watch request counts (10–15 min)
4. Copy/adapt the LinkedIn post and share what clicked for you (5 min)

Then go deep in sibling folders:

- [short polling](../short%20polling/)
- [long polling](../long%20polling/)
- [web socket](../web%20socket/)

## One-line takeaway

**Communication technique = how (and how often) the client and server exchange “anything new?” — not what the API looks like.**
