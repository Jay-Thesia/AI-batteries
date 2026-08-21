# LinkedIn Post — WebSockets

---

## Ready-to-post version

Spent some time revisiting WebSockets — not the libraries, the transport model.

Most teams don’t struggle with `new WebSocket(url)`. They struggle with the shift in thinking:

HTTP asks: “One request, one response, then we can hang up.”  
WebSockets ask: “Upgrade once, then both sides speak in frames whenever they need to.”

That single change explains the real work:

• You still need a message protocol (`type`, `id`, errors) — the socket does not give you an API  
• The server now holds connection state: registry, heartbeats, cleanup on close  
• Reconnect without a cursor is silent data loss  
• Fan-out across multiple nodes still needs a pub/sub  

WebSockets are not a REST replacement. They’re a stronger fit when both sides chatter, latency matters, and you are willing to operate long-lived connections.

If you’re adopting them: design the frame contract first. Heartbeats second. Framework last.

#WebSockets #SystemDesign #BackendEngineering #SoftwareArchitecture

---

## Optional shorter version

Revisiting WebSockets with a stricter lens:

It’s less about “real-time” and more about a duplex pipe.

Handshake = HTTP upgrade  
Frames = your protocol  
Reconnect = catch up from a cursor

Use it when both sides talk often. If the client only asks every 30s, polling is still the honest design.

#WebSockets #SystemDesign
