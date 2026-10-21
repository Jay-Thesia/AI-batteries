# REST — like explaining to a 5-year-old

Imagine a **toy store** with lots of toys on labeled shelves.

### REST way — labeled shelves + clear verbs
Every shelf has a **name** (a URL):
- Shelf `/toys/cars` → cars
- Shelf `/toys/cars/1` → the red car
- Shelf `/toys/cars/1/wheels` → that car’s wheels

And you use clear actions (HTTP verbs):
- **GET** = “show me what’s on this shelf”
- **POST** = “put a new toy on this shelf”
- **PUT/PATCH** = “change this toy”
- **DELETE** = “remove this toy”

If you want the red car’s name **and** wheels, you might visit more than one shelf.
That’s okay — each shelf has one clear job.

### Compared to GraphQL
- REST: “Go to the right shelf. Ask for what’s there.”
- GraphQL: “Write one wish list. Helper gathers everything.”

---

**That’s REST:**
- Things (resources) live at **addresses**
- You say **what to do** with a verb (GET/POST/…)
- Each address usually returns a **fixed package** of data

Like a post office:
- Address = which box
- Stamp/action = send, pick up, update, cancel
- What’s in the box is decided by the post office for that address
