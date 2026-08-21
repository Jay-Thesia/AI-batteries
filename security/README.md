# Security

How a web app **gets tricked** — not how JSON is shaped, and not how the client stays live.

API contracts live under `Networking/Communication-protocol/`.  
Delivery patterns live under `communication techinque/`.  
This folder is a third knob: **trust boundaries**. Who is allowed to make whose browser or server do work?

| Folder | What to learn |
|---|---|
| [overview](./overview/) | Map of the common web attacks and the one mental model behind them |
| [XSS](./XSS/) | Untrusted text treated as HTML/JS — the browser runs the attacker’s code |
| [CSRF](./CSRF/) | Cookie-backed action without proof **this site** meant it |

Start at **overview**, then go deep in XSS and CSRF.
