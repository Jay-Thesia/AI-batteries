# LinkedIn Post — Long Polling

---

## Ready-to-post version

Spent some time revisiting long polling — the technique people skip on the way to WebSockets.

Most teams don’t struggle with “hold the request.” They struggle with the shift in thinking:

Short polling sleeps on the client.  
Long polling sleeps on the server.

The HTTP contract stays request/response. The response is just **late on purpose** — until a delta exists, or a timeout protects you from idle-proxy death.

That model explains the real bugs:

• Always read the store before parking, or you drop events in the gap between waits  
• Empty 200 after timeout means “ask again now,” not “sleep like a poller”  
• Waiters are memory + sockets — disconnect must unregister them  
• Multiple app instances still need a pub/sub to wake everyone  

Long polling is not a relic. It’s a stronger fit when you want near-real-time over boring HTTP and you are not ready to operate a duplex socket fleet.

If you’re implementing it: cursor first. Timeout second. Fan-out third.

#SystemDesign #BackendEngineering #HTTP #SoftwareArchitecture

---

## Optional shorter version

Revisiting long polling with a stricter lens:

It’s less about “slow polling” and more about who waits.

Client asks once and camps  
Server answers when the cursor is stale  
Timeout empty = success, retry immediately

Use it when HTTP must stay, but empty 200s are too expensive. When both sides need to chatter, open a WebSocket.

#SystemDesign #HTTP
