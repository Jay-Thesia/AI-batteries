# Web Security Attacks Learning Pack

All material for comparing **how web apps get tricked** lives in this folder.

This is not REST vs GraphQL, and not polling vs WebSockets. Those are contracts and delivery. These are **trust bugs**: the app treats attacker-controlled data as if it were its own code, its own user, or its own server.

| File | What it is |
|---|---|
| [00-nutshell-for-a-5-year-old.md](./00-nutshell-for-a-5-year-old.md) | Ultra-simple explanation |
| [01-blog-full-mental-model.md](./01-blog-full-mental-model.md) | Full blog + mental model of the attack map |
| [02-linkedin-post.md](./02-linkedin-post.md) | Ready-to-post LinkedIn text |

## Suggested learning order (25–40 min)

1. Read the 5-year-old nutshell (2 min)
2. Read the mental-model blog (20–25 min)
3. Copy/adapt the LinkedIn post and share what clicked for you (5 min)

Then go deep in sibling folders:

- [XSS](../XSS/)
- [CSRF](../CSRF/)

## One-line takeaway

**A web attack is a trust mix-up: attacker data is treated as code, as “the real user,” or as “our own backend.”**
