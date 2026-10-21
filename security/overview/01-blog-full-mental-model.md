# Web Security Attacks — Full Mental Model

> Goal: after reading this, you should be able to *place* a bug on a map — not memorize a list of scary acronyms.

---

## 1. What problem do “security attacks” name?

Your app has **three kinds of actor**:

```
  Attacker / malicious page
           │
           ▼
     Browser (the user)
           │
           ▼
     Your server + DB
```

Normal product code assumes:

- HTML/JS on your origin is **yours**
- A request with a session cookie is **the user clicking**
- A string from a form is **data**, not a command
- A URL your server fetches is **a picture you chose**

Every common web attack is one of those assumptions being **false**.

REST vs GraphQL is a schema question.  
Polling vs WebSockets is a delivery question.  
This folder is a **trust** question:

> Who is allowed to make whose browser or server do work?

---

## 2. Core mental model (keep this forever)

Draw **trust boundaries**. Data that crosses a boundary is hostile until proven otherwise.

```text
untrusted  ──►  your code  ──►  a powerful interpreter
  user input      handler        browser / SQL / shell / URL fetcher
```

If untrusted bytes reach an interpreter **without being labeled as data**, the interpreter runs them.

| Boundary | If you mix it up | Family of bugs |
|---|---|---|
| Attacker text → browser HTML/JS | Browser runs their script on your origin | XSS |
| Attacker site → your cookie-backed POST | Server thinks the user meant it | CSRF |
| Attacker text → SQL / shell / LDAP | Database or OS runs their command | Injection |
| Attacker URL → your server’s HTTP client | Server fetches internal stuff for them | SSRF |
| Attacker UI overlay → your button | User clicks the wrong thing | Clickjacking |
| Attacker id → your object fetch | They read/write someone else’s row | IDOR / BAC |
| Attacker file path → your filesystem | They read `../` secrets | Path traversal |
| Attacker XML → your parser | Parser loads extra files/URLs | XXE |

A request is basically:

> “Is this *data I display*, *an action the user chose*, or *code I should run*?”

That is the whole idea.

---

## 3. Same-origin policy (the browser’s one big lock)

Browsers isolate sites by **origin** = scheme + host + port.

`https://app.example:443` cannot freely read `https://bank.example`’s DOM or cookies.

That lock is why XSS is so valuable: if attacker script runs **on your origin**, it inherits **your** cookies, **your** localStorage, **your** API calls. CSRF is the other side: another origin cannot read your page, but it might still **trigger** a cookie-authenticated request unless you block that.

Remember the split:

- **Read** across origins: mostly blocked (SOP, CORS)
- **Write / navigate / submit**: often allowed (that’s CSRF’s opening)

CORS is not a lock you add for fun. It is a **relaxation** of SOP for APIs that *choose* to be readable by other sites. A `*` with cookies is a self-inflicted wound.

---

## 4. The attack map (what each name actually means)

### XSS — Cross-Site Scripting

Untrusted string is parsed as HTML or JS **in your origin**.

The browser’s job is to run scripts on a page. If attacker text becomes part of that page’s code, they act as your frontend.

Three shapes (details live in [XSS/](../XSS/)):

- **Reflected** — comes in the request, bounces into the response
- **Stored** — saved (comment, profile), served later to others
- **DOM-based** — your client JS writes location/hash/input into the DOM unsafely

Defense idea: **encode for context** (or `textContent`), plus CSP as a seatbelt. Never “filter the bad words.”

### CSRF — Cross-Site Request Forgery

The browser **automatically attaches cookies** to requests to your origin. Another site can cause that request (form, image, some fetch modes). Your server sees a valid session and does the action.

Classic: “change email,” “transfer money,” “add admin” — anything that is “session cookie + POST” with no extra proof that **this site** initiated it.

Defense idea: something the other site cannot guess/read:

- Synchronizer / double-submit CSRF token
- `SameSite=Lax` or `Strict` cookies (helps a lot; not the whole story)
- Prefer JSON APIs that require a custom header (other sites cannot set it on a simple form)

CSRF is **not** XSS. XSS already has your origin. CSRF needs you logged in and a state-changing request the attacker can trigger blindly.

### Injection (SQL, command, LDAP, NoSQL)

Untrusted string is concatenated into a **query language**.

```
"SELECT * FROM users WHERE id = '" + userInput + "'"
```

The database does not know which part was “your SQL” and which part was “their id.”

Defense idea: **parameterized queries** / bind variables. Escaping by hand is how you get one more CVE. Command injection is the same shape with `exec` / `eval` / shells.

### SSRF — Server-Side Request Forgery

Your server has a “fetch this URL” feature (preview cards, webhooks, image resize, PDF render). The attacker supplies `http://169.254.169.254/` or `http://localhost/admin`.

The server is **inside** the firewall. The attacker is not. They borrowed your network identity.

Defense idea: allowlists of hosts, block link-local/metadata IPs, don’t follow redirects blindly, don’t expose response bodies from internal URLs.

### Clickjacking (UI redress)

Your page is loaded in a transparent iframe. The user thinks they are tapping a game. They are tapping **Allow camera** or **Delete account**.

Defense idea: `Content-Security-Policy: frame-ancestors 'self'` (modern) and/or `X-Frame-Options`. Don’t rely on the user noticing overlays.

### IDOR / broken access control

`GET /invoices/1842` returns that invoice **if the number exists**, not **if this user owns it**.

The “I” in IDOR is “insecure direct object reference.” Today people just say **broken access control** — still the #1 real-world class.

Defense idea: every read/write checks **authorization** against the session, not just “is this id in the table?”

### Open redirect

`/login?next=https://evil.example` sends the user somewhere that *looks* like it came from you (phishing, token leak in Referer).

Defense idea: allow relative paths on your origin only. Never bounce to an arbitrary URL.

### Path traversal / local file include

`/files?name=../../etc/passwd` if you join user input onto a directory.

Defense idea: resolve the path, then assert it still lives under the intended root. Don’t concatenate.

### XXE — XML External Entities

Old XML parsers expand `<!ENTITY>` and will fetch files or URLs. Uploading “an XML invoice” becomes file read or SSRF.

Defense idea: disable external entities / use a parser that never had them on. Prefer JSON if you can.

### Session attacks (hijack, fixation, weak cookies)

If a session id is in a URL, in a non-HttpOnly cookie, or guessable, XSS or a network sniffer **becomes** that user.

Defense idea: random session ids, `Secure` + `HttpOnly` + `SameSite`, rotate on login, HTTPS everywhere.

### Prototype pollution (JavaScript)

Deep merge of JSON into `{}` that walks `__proto__`. Later, `obj.isAdmin` is true for everyone.

Defense idea: don’t merge untrusted keys named `__proto__` / `constructor` / `prototype`. Use `Object.create(null)` maps where it matters.

### Mass assignment

`PATCH /users/me` with `{ "role": "admin" }` if your ORM copies every JSON key onto the row.

Defense idea: allowlist fields per endpoint.

### Brute force / credential stuffing

Not a “clever parser bug.” Login is a **guessing** API. Without rate limits, lockouts, and (for humans) 2FA, leaked password lists win.

Defense idea: throttle, detect stuffing, don’t reveal “this email exists” unless you must.

---

## 5. How a request actually travels (same product, different mix-ups)

Imagine a comment box plus a “delete my account” button.

**XSS path**

```
Attacker writes text ──► stored in DB ──► HTML response
Browser parses that text as markup/script on your origin
Script can call your APIs as the victim
```

**CSRF path**

```
Victim is logged in (cookie sits in the browser)
Attacker page causes a request to your origin
Browser attaches the cookie
Server deletes the account — no extra “did they mean it?”
```

**Injection path**

```
Search box ──► concatenated SQL ──► database interpreter
Rows leak, or worse, writes happen
```

**SSRF path**

```
“Preview this link” ──► server HTTP client ──► internal host
Attacker reads the response your server got
```

Notice: the **product** is identical (comments, accounts, previews). Only **which interpreter trusted the wrong bytes** changes.

---

## 6. Cookies, CORS, and “who clicked”

Three facts that unlock CSRF vs XSS vs CORS confusion:

1. **Cookies are origin-scoped**, and the browser may send them without your JS asking.
2. **JS on origin A cannot read origin B’s responses** unless B’s CORS headers allow A.
3. **JS on origin A that is actually XSS on B** *is* origin B — CORS does not save you.

So:

| Situation | Cookie sent? | Attacker reads response? |
|---|---|---|
| XSS on your site | Yes, their script is you | Yes |
| CSRF from other site | Often yes | Usually no (that’s why CSRF is “blind”) |
| CORS `*` + no cookies | No session | Public data only |
| CORS reflects attacker origin + `credentials` | Yes | Catastrophic |

---

## 7. Defense in depth (one idea per layer)

You never have one lock.

| Layer | What it buys |
|---|---|
| Output encoding / `textContent` | XSS doesn’t become DOM |
| Parameterized queries | Injection doesn’t become SQL |
| AuthZ on every object | IDs are not capability tokens |
| CSRF token / SameSite | Other sites can’t ride the cookie |
| CSP / frame-ancestors | Seatbelt if HTML slips through |
| Allowlists on outbound fetch | SSRF can’t wander the VPC |
| HttpOnly + Secure cookies | Stolen DOM ≠ instant session (XSS still hurts) |
| Rate limits | Guessing stops being free |

Encoding is **not** validation. Validation is “this should be an email.” Encoding is “whatever it is, the next interpreter must see it as data.” You need both; they solve different bugs.

---

## 8. How to choose what to study first

If you build **web UIs**: start with **XSS**, then CSRF, then CORS.

If you build **APIs + DBs**: start with **access control**, then injection, then mass assignment.

If you build **anything that fetches URLs**: add **SSRF** before you ship the unfurl feature.

The overview is a map. Depth folders (starting with XSS) are the terrain.

---

## 9. Common mistakes

1. **Treating security as a library** — `helmet` helps headers; it does not encode your comments  
2. **Blacklists** — “strip `<script>`” loses to the next encoding  
3. **Confusing CSRF and XSS** — one rides cookies from another site; one *is* your site  
4. **Confusing CORS with CSRF protection** — CORS limits *reads* from JS; CSRF is about *writes* the browser still sends  
5. **Authorize once at login** — every object still needs a check  
6. **“It’s an internal URL preview, it’s fine”** — that is the SSRF feature  
7. **Mixing this with REST vs GraphQL** — GraphQL can still XSS, CSRF, and IDOR; the contract does not save you

---

## 10. Full picture in one diagram

```text
                    untrusted input
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
     Browser DOM      Your queries    Your HTTP client
     (HTML / JS)      (SQL / shell)   (fetch URL)
          │               │               │
        XSS           Injection         SSRF

     cookie auto-sent from other site ──► CSRF
     missing “is this their row?”     ──► IDOR
     iframe overlay                   ──► clickjacking
```

Your job when learning this map:
1. Name the **interpreter** (browser, SQL, shell, HTTP client)
2. Name the **trust boundary** the bytes crossed
3. Label data as **data** before it hits the interpreter
4. Check **who** may do the action, not only **whether the id exists**
5. Use headers (CSP, SameSite, frame-ancestors) as **seatbelts**, not as the only lock

---

## 11. Mini glossary

- **Origin**: scheme + host + port — the browser’s site identity
- **SOP**: same-origin policy — default isolation between origins
- **CORS**: optional holes in SOP so another origin’s JS may read your responses
- **XSS**: attacker script runs in your origin
- **CSRF**: attacker site triggers a cookie-authenticated action
- **Injection**: data concatenated into a command language
- **SSRF**: server fetches an attacker-chosen URL
- **IDOR / BAC**: object access without ownership check
- **CSP**: Content-Security-Policy — extra limits on what the page may load/run
- **Encoding**: turning data into a safe form for a specific context

---

## 12. What “good understanding” looks like

You understand the attack map when you can answer:

1. Why is this **not** the same topic as REST vs GraphQL?
2. Which interpreter did the untrusted bytes reach?
3. Why does XSS beat CSRF in power (they run as your frontend)?
4. Why does `SameSite` help CSRF but not XSS?
5. Why is “valid id” not the same as “allowed for this user”?

If those answers are clear, your mental model is solid.

---

## Next step

Open:
- [XSS](../XSS/) — how the browser decides that text is code
- [CSRF](../CSRF/) — how a cookie is not the same as “the user clicked here”
- Run the examples: encoding keeps markup as letters; a token-less change is rejected
