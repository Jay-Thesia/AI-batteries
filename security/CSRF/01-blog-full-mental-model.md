# CSRF — Full Mental Model

> Goal: after reading this, you should be able to *think* in “cookie is not intent,” not “we have CORS so we’re fine.”

---

## 1. What problem does CSRF name?

Browsers **attach cookies** to requests to an origin. You do not call `document.cookie` for that. Navigation, forms, and many image/fetch cases just send them.

Your server often treats “valid session cookie” as:

> The logged-in user meant this action.

That is true when they clicked **your** “Save email” button.

It is false when **another origin** caused the browser to send the same kind of request. The cookie still goes. The user never agreed.

**Cross-Site Request Forgery (CSRF)** is that mix-up: **authentication without intent**.

The attacker usually **cannot read** your page (same-origin policy). They do not need to. Changing an email, adding an admin, or transferring money is a **write**. Blind writes are enough.

---

## 2. Core mental model (keep this forever)

```
User is logged in (cookie sits in the browser)
        │
        ▼
Some request hits your origin
        │
        ├── cookie + proof it came from YOUR UI  →  real action     ✅
        └── cookie only, caused elsewhere        →  forged action   ❌ CSRF
```

CSRF is:

> “The session said who they are. Did **this site** say they wanted this?”

Mental shift:

| Unsafe thinking | CSRF thinking |
|---|---|
| “They’re logged in, so they clicked” | Cookie ≠ click |
| “CORS will block it” | CORS limits *JS reads*; the browser can still *send* |
| “It’s JSON, we’re safe” | Simple form POSTs are still cookies + body |
| “SameSite is enough forever” | Helps a lot; tokens still matter (old browsers, `None`, subdomain bugs) |
| “XSS and CSRF are the same” | XSS *is* your origin; CSRF is *another* origin riding the cookie |

The server does not see “a tab on evil.example.” It sees an HTTP request that looks like yours.

---

## 3. Why “cross-site”? (cookies cross the street)

Same-origin policy mostly blocks **reading** another origin’s responses and DOM.

It does **not** block:

- Submitting a form to another origin
- Navigating to another origin
- Some cookie-bearing requests the browser sends on its own

So:

| Situation | Cookie sent? | Attacker reads the JSON? |
|---|---|---|
| User uses your settings page | Yes | Yes (it’s your JS) |
| Other site causes a request to you | Often yes | Usually **no** (blind CSRF) |
| XSS on your site | Yes | Yes — that’s a different bug |

CSRF is valuable because **session cookies are ambient**. Bearer tokens in `Authorization` headers are not ambient — other sites cannot set that header on a simple form. That is why APIs that only accept a custom header are harder to CSRF (still check Origin if cookies exist).

---

## 4. What must be true for CSRF to matter

All of these:

1. The victim has a **live session** (cookie still valid)
2. The action is **cookie-authenticated** (no extra secret)
3. The action **changes state** (email, password, role, money)
4. The server cannot tell **your page** from **a foreign cause**

If the endpoint is read-only, CSRF is usually a nuisance, not a compromise. If you used GET for “delete account,” you made CSRF trivial *and* broke HTTP semantics.

---

## 5. Defenses (locks that stack)

**1. CSRF token (synchronizer) — the real proof**

Your page gets a secret bound to the session. State-changing requests must send it (header or body). Another origin cannot **read** that token (SOP). They cannot guess it if it is long and random.

This is what the demo implements: `GET /session` returns `csrfToken`; `POST /email` requires `X-CSRF-Token`.

**2. `SameSite` on the session cookie**

- `Lax` (good default): cookie is withheld on most cross-site POSTs; still sent on top-level GET navigations
- `Strict`: withheld even on those GET navigations (awkward for “click a link back to us”)
- `None; Secure`: sent cross-site — you **must** have another CSRF lock

`SameSite` is a huge win. It is not the only lock (embedded flows, `None`, older clients).

**3. Check `Origin` (and `Referer` as fallback)**

For POST/PUT/PATCH/DELETE, require `Origin` to be your site. Foreign pages send a foreign Origin. This is cheap extra proof. Some privacy modes omit Referer; prefer Origin.

**4. Prefer non-ambient auth for APIs**

`Authorization: Bearer …` from JS your origin ran. Cross-site forms cannot attach that. If you *also* accept cookies on the same API, you are back in CSRF land.

**5. Don’t change state on GET**

Prefetch, links, and `SameSite=Lax` navigations all GET. Mutations belong on POST/PUT/PATCH/DELETE **with** a token.

---

## 6. Double-submit vs synchronizer (know the difference)

**Synchronizer (demo):** token stored in the **session** on the server. Request must match. Classic, clear.

**Double-submit cookie:** token in a cookie JS can read, copied into a header. Server checks cookie === header. No server store. Weaker if a subdomain can set cookies on the parent. Fine for many apps; know the trade.

Either way the idea is the same: **something SOP stops the other site from reading or forging.**

---

## 7. CSRF vs XSS vs CORS (stop mixing these)

| | CSRF | XSS | CORS misconfig |
|---|---|---|---|
| Attacker’s code runs on your origin? | No | Yes | No |
| Uses your session cookie? | Yes, blindly | Yes, fully | Depends |
| `SameSite` helps? | Yes | No | No |
| Token / Origin check helps? | Yes | No (they *are* the page) | Different issue |

CORS with `Access-Control-Allow-Origin: *` and **no credentials** does not CSRF you. CORS that **echoes the attacker origin** and `Allow-Credentials: true` lets their JS **read** your APIs — that is not CSRF; it is “you opened SOP.”

---

## 8. What the demo is teaching

The code example is a **change-email** page:

- Login sets `sid` — `HttpOnly`, `SameSite=Lax`
- The page loads a **CSRF token** from `/session`
- Changing email sends the cookie (automatic) **and** `X-CSRF-Token` (intentional)
- The same POST **without** the header is rejected

You should feel: cookie answers “who.” Token answers “did our UI mean it.”

This pack does not include a “foreign page that triggers the action” lab. The skill is requiring proof of intent on every cookie-backed write.

---

## 9. Common mistakes

1. **Token on GET only** — the mutation never checks it  
2. **Token not bound to the session** — one user’s token works for another  
3. **Checking CORS and calling it CSRF protection** — different knobs  
4. **GET `/delete?id=`** — the internet will request it for you  
5. **`SameSite=None` without a token** — you opted back into cross-site cookies  
6. **Skipping CSRF because “we’re a SPA”** — if the API still uses cookies, you still need a lock  
7. **Treating XSS as CSRF** — XSS bypasses CSRF tokens because the script can read them

---

## 10. Full picture in one diagram

```text
Browser has session cookie for your origin
                 │
     ┌───────────┴───────────┐
     ▼                       ▼
 Your settings page      Some other site
 POST + cookie           causes a request
 + CSRF token            + cookie only
     │                       │
     ▼                       ▼
 Server: who + intent    Server: who only
     ✅                      ❌ unless you reject
```

Your job when learning CSRF:
1. Treat cookies as **identity**, not **intent**
2. Put a **secret the other origin cannot read** on writes
3. Set **`SameSite`** (usually `Lax`)
4. Check **`Origin`** on mutations
5. Remember **XSS eats CSRF defenses** — they already have the page

---

## 11. Mini glossary

- **CSRF**: cookie-authenticated action without proof your UI started it
- **Ambient credential**: sent by the browser without JS asking (cookies)
- **Synchronizer token**: secret stored in the session, required on the request
- **Double-submit**: cookie copy of the token, compared to a header
- **SameSite**: cookie rule for cross-site requests (`Lax` / `Strict` / `None`)
- **Origin header**: which site caused the request (browser-set)
- **Intent**: “the user acted on *our* page,” not merely “they are logged in”

---

## 12. What “good understanding” looks like

You understand CSRF when you can answer:

1. Why does a valid session cookie not prove the user clicked *here*?
2. Why doesn’t CORS, by itself, stop CSRF?
3. Why can another origin usually not *read* the CSRF token?
4. What does `SameSite=Lax` change about cross-site POSTs?
5. Why does XSS make CSRF tokens useless?

If those answers are clear, your mental model is solid.

---

## Next step

Open:
- `03-code-example/` and run the account page
- Log in, change email **with** the token
- Try the same change **without** the token — it should fail
- Then curl both paths from the README
