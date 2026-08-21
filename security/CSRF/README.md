# CSRF Learning Pack

All material for learning **Cross-Site Request Forgery** lives in this folder.

| File | What it is |
|---|---|
| [00-nutshell-for-a-5-year-old.md](./00-nutshell-for-a-5-year-old.md) | Ultra-simple explanation |
| [01-blog-full-mental-model.md](./01-blog-full-mental-model.md) | Full blog + mental model |
| [02-linkedin-post.md](./02-linkedin-post.md) | Ready-to-post LinkedIn text |
| [03-code-example/](./03-code-example/) | Tiny account page: session cookie **plus** a CSRF token |

## Suggested learning order (30–45 min)

1. Read the 5-year-old nutshell (2 min)
2. Read the mental-model blog (15–20 min)
3. Run the code example: change email with a token, then without one (10–15 min)
4. Copy/adapt the LinkedIn post and share what clicked for you (5 min)

## One-line takeaway

**CSRF = the browser attached a session cookie, so the server treated a request as “the user clicked” — prove the request came from your page (token, SameSite, Origin).**
