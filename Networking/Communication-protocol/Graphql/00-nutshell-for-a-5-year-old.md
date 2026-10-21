# GraphQL — like explaining to a 5-year-old

Imagine a **toy store** with lots of toys on many shelves.

### Old way (REST) — many trips
You want:
- a red car
- the car’s name
- and how many wheels it has

With the old way, you might need:
1. Go to shelf A → get the car
2. Go to shelf B → get the name
3. Go to shelf C → get the wheels

Many walks. Tiring. Sometimes you bring home toys you didn’t even ask for.

### GraphQL way — one trip, exact toys
You write a **wish list** once:

> “I want the red car’s **name** and **wheels**. Nothing else.”

You give that wish list to one helper (the GraphQL server).
The helper brings back **exactly** those things. One trip. No extras.

---

**That’s GraphQL:**
- You say **exactly** what you want
- You ask in **one place**
- You get **only** what you asked for

Like ordering ice cream:
- REST: “Give me the whole dessert menu” then pick
- GraphQL: “One scoop vanilla, one scoop chocolate” — and that’s what you get
