# CSRF — like explaining to a 5-year-old

You wear a **clubhouse bracelet**. The door opens for anyone wearing it. You do not have to shout your name every time.

That is convenient. It is also the trick.

Someone on the **other side of the street** yells:

> “Clubhouse! Change Ada’s locker number!”

You did not walk over. You did not agree. But you still have the bracelet on. If the door only checks “is there a bracelet?” it does the change.

---

**That’s CSRF:**

- The bracelet is the **session cookie** (the browser sends it by itself)
- The shout from the street is a request **another site caused**
- The door thought **you** asked

The fix is a **secret handshake** only the real clubhouse page knows (a CSRF token), plus a bracelet rule that says “don’t use this for random street errands” (`SameSite`).
