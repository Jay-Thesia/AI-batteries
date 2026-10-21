# XSS — like explaining to a 5-year-old

The class has a **bulletin board**.

Anyone may pin a note. The board is supposed to **show writing**.

A note is just letters: “I like apples.”

Trouble starts if the board **obeys** the note like a recipe:

- “Make this word huge”
- “Turn this into a button”
- “When someone looks, run my instructions”

The note-writer then runs the classroom, not the teacher.

---

**That’s XSS:**

- People should write **messages**
- The page should **display** messages
- The page must **not treat those messages as code**

The fix is boring and perfect: hang every note as **plain letters**. If someone draws angle brackets, you still see angle brackets — the board does not follow them.
