# Communication techniques — like explaining to a 5-year-old

Imagine you want to know when the **cookie jar** has new cookies.

### Short polling — keep asking
Every few seconds you walk to the kitchen:

> “Any cookies yet?”  
> “No.”  
> “Any cookies yet?”  
> “No.”  
> “Any cookies yet?”  
> “Yes! Two chocolate ones.”

You always get an answer fast. You also walk a lot for nothing.

### Long polling — wait in the kitchen
You walk to the kitchen once and **stay there**:

> “Tell me when there are cookies. I’ll wait.”

Mom answers only when cookies appear (or if you’ve waited too long). Fewer walks. You occupy a chair the whole time.

### WebSocket — leave a walkie-talkie
You put a **walkie-talkie** on the counter.

Mom can shout “cookies!” the instant they exist.  
You can shout “I want milk too!” without walking again.

The channel stays open both ways.

---

**That’s the whole family:**

- Short polling: “I’ll ask again in a bit.”
- Long polling: “I’ll wait here until you have news.”
- WebSocket: “Let’s keep a live line open.”

REST / GraphQL / gRPC decide **what the message looks like**.  
These techniques decide **when the message travels**.
