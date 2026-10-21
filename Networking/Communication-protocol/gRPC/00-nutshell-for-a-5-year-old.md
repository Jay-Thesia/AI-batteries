# gRPC — like explaining to a 5-year-old

Imagine two friends in different houses who want to play the same game together.

### Old phone way (REST / JSON HTTP)
One friend writes a long letter:
> “Please go to the toy shelf labeled `/toys/cars/1` and tell me what’s there.”

The other friend reads the letter, finds the shelf, writes another long letter back.
Letters are easy to read, but slow and wordy.

### gRPC way — walkie-talkie with a shared rulebook
Both friends agree on a **rulebook** first (a `.proto` file):

> “We have a move called `GetCar`. You say the car number. I answer with name + wheels.”

Then they use a **walkie-talkie** (gRPC over HTTP/2):
- Friend A presses the button and says: `GetCar(1)`
- Friend B answers immediately with exactly the agreed shape

No guessing shelves. No long letters. Same words, same order, every time.

### Bonus: streaming
Sometimes Friend B can keep talking:
> “Here’s car 1… here’s car 2… here’s car 3…” (server streaming)

Or both can talk back and forth like a real conversation (bidirectional streaming).

---

**That’s gRPC:**
- You define **functions** (RPCs), not shelves (URLs)
- Both sides share one **contract** (`.proto`)
- Messages are **compact and typed** (Protobuf)
- You can send **one answer** or a **stream of answers**

Like ordering food:
- REST: “Bring me menu item #7 from the kitchen window”
- gRPC: “Call the kitchen’s `MakeBurger()` function” — and both kitchens speak the same recipe language
