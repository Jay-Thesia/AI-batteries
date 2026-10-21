# LinkedIn Post — Communication Techniques

---

## Ready-to-post version

Spent some time separating two ideas teams mash together: **API contracts** and **communication techniques**.

REST / GraphQL / gRPC answer: “What does the message look like?”  
Short polling / long polling / WebSockets answer: “How does the client find out something changed?”

That split explains most live-feature design:

• Short polling is a timer plus empty HTTP 200s — simple, wasteful, fine when delay is okay  
• Long polling holds the request until there is news — push-like latency on plain HTTP  
• WebSockets keep a duplex pipe — both sides talk without a new handshake each time  

The contract can stay the same. You can poll a REST list, long-poll the same cursor, or stream the same events over a socket.

If you’re designing “real-time”: pick the waiting strategy first. Schema second. Fancy libraries last.

#WebSockets #SystemDesign #BackendEngineering #SoftwareArchitecture

---

## Optional shorter version

Revisiting live updates with a stricter lens:

It’s less about “we need WebSockets” and more about who waits.

Short poll = client knocks on a timer  
Long poll = client camps at the door  
WebSocket = intercom stays open

Same inbox. Different delivery. Use HTTP when a click is enough.

#SystemDesign #WebSockets #BackendEngineering
