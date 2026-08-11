# LinkedIn Post — REST API

---

## Ready-to-post version

Spent some time revisiting REST fundamentals today — not the frameworks, the resource model.

Most teams don’t struggle with Express or status codes. They struggle with the shift in thinking:

REST asks: “Which resource lives at this URL, and what verb am I applying?”  
GraphQL asks: “What graph of data does this screen need?”

That single framing explains most of the design decisions:

• URLs become the product contract, not an afterthought  
• HTTP verbs carry meaning — GET reads, POST creates, PATCH updates, DELETE removes  
• Status codes are part of the API, not decoration  
• Fixed response shapes trade flexibility for cacheability and simplicity

REST is not outdated by default. It’s a stronger fit when resources are naturally CRUD-shaped, URL-level caching matters, and clients can live with clear endpoints instead of per-screen query trees.

If you’re designing it: model the domain as resources first. Routes second. Clever RPC-style URLs last.

#REST #APIDesign #BackendEngineering #SoftwareArchitecture

---

## Optional shorter version

Revisiting REST with a stricter lens:

It’s less about “JSON over HTTP” and more about making resources explicit.

URL = address of a resource  
Verb = intent  
Status code = outcome

Use it when your domain maps cleanly to collections and members, and clients share similar shapes. When every screen needs a different nested slice, GraphQL may fit better.

#REST #APIDesign
