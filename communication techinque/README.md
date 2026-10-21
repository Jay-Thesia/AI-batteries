# Communication techniques

How a client **learns that something changed** — not what the JSON looks like.

API contracts (REST, GraphQL, gRPC) live under `Networking/Communication-protocol/`.  
This folder is the other knob: polling vs holding a request vs keeping a socket open.

| Folder | What to learn |
|---|---|
| [overview](./overview/) | Compare all three on one inbox |
| [short polling](./short%20polling/) | Timer + immediate HTTP answers |
| [long polling](./long%20polling/) | Held HTTP until news or timeout |
| [web socket](./web%20socket/) | HTTP upgrade, then duplex frames |

Start at **overview**, then go deep in one technique.
