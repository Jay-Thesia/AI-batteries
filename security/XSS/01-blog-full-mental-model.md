# XSS — Full Mental Model

> Goal: after reading this, you should be able to *think* in “data vs code in the browser,” not “remember to strip script tags.”

---

## 1. What problem does XSS name?

The browser’s job on your origin is:

1. Parse HTML
2. Run JavaScript that the page includes
3. Attach cookies / storage / network access **for that origin**

That is a feature. Users need a live app.

**Cross-Site Scripting (XSS)** is when **someone else’s text** is fed into step 1 or 2 as if it were **your** HTML or JS.

Then their code inherits **your** origin: same APIs, same cookies (unless HttpOnly), same user’s session in the browser.

This is not “they sent a scary string to the server.” The server may store it faithfully. The bug is **how the page is built** when that string comes back.

---

## 2. Core mental model (keep this forever)

```
Untrusted string
      │
      ▼
Inserted into a *context* (HTML body, attribute, JS, URL, CSS)
      │
      ▼
Browser parser / JS engine
      │
      ├── treated as data  →  user sees letters   ✅
      └── treated as code  →  attacker runs here  ❌ XSS
```

XSS is:

> “The next interpreter is the browser. Did we tell it this string is *data*?”

Mental shift:

| Unsafe thinking | XSS thinking |
|---|---|
| “Filter the word script” | Encode for the **context** you are in |
| “It’s only a comment” | Stored comments are **HTML you will parse later** |
| “innerHTML is fine, we trust users” | Users include attackers, and attackers include other users’ browsers |
| “CSP will save us” | CSP is a seatbelt; encoding is the seatbelt *and* the driving |
| “JSON API, so no XSS” | Your SPA still writes into the DOM |

The browser does not know “this came from a comment table.” It only knows “this is the document.”

---

## 3. Why “cross-site”? (origin is the prize)

Browsers isolate sites by **origin** (scheme + host + port).

Script on `https://evil.example` cannot read `https://app.example`’s DOM or cookies.

If their script **runs on `https://app.example`**, isolation does not apply. They *are* the app, in that tab.

That is the “cross-site” in the old name: attacker content, **your** site’s privileges.

CORS does not fix XSS. CORS is about other origins reading responses. XSS already lives on your origin.

HttpOnly cookies reduce “steal the session id from `document.cookie`.” They do **not** stop the script from calling `/transfer` as the user. XSS is still a full frontend compromise.

---

## 4. Three delivery paths (same bug, different pipes)

### Stored (persistent)

Text is saved (comment, bio, filename shown later) and served to **other people**.

This is the worst product bug: one write, many victims.

The demo in `03-code-example/` is this shape — a comment wall — built **correctly** so saved text cannot become markup.

### Reflected

Text rides in the request (query string, header) and is copied into **that** response.

Classic: a search page that prints `You searched for: …` by concatenating HTML.

The victim must open a crafted URL (phishing). Still XSS if they do.

### DOM-based

The server’s HTML may be fine. **Your client JS** reads `location`, `hash`, `postMessage`, or a widget value and writes it into the DOM unsafely (`innerHTML`, `document.write`, `eval`, some template libs).

The server never sees the payload. Debug in the browser, not in access logs.

All three are the same mental model: **untrusted string + unsafe sink**.

---

## 5. Context is the whole game

“Escape HTML” is incomplete. Encoding depends on **where** the string lands.

| Context | What “data” means |
|---|---|
| HTML body | Encode `& < >` (and quotes if you must) so tags are letters |
| HTML attribute | Encode quotes too, or you leave the attribute |
| JavaScript string | JS string escaping — HTML escaping is the wrong tool |
| URL | Encode for URLs; never drop untrusted data into `javascript:` |
| CSS | Don’t put untrusted text in style sheets |

The safe default for UI text:

```js
el.textContent = userText; // not innerHTML
```

`textContent` never parses HTML. That is the comment-wall demo.

If you **must** allow rich text (bold, links), that is a **sanitizer** problem: a library that produces a tiny HTML subset. “Allow some tags” by regex is how stored XSS ships.

---

## 6. Sinks (where the string becomes code)

You do not need a catalog of exploits. You need to spot **sinks**:

- `innerHTML`, `outerHTML`, `insertAdjacentHTML`
- `document.write`
- Assigning to `location` / `href` / `src` from untrusted data
- `eval`, `new Function`, `setTimeout(string)`
- Template engines that do not auto-escape
- React `dangerouslySetInnerHTML` (the name is the warning)
- Server templates: `res.send("<p>" + comment + "</p>")`

The fix is almost always:

1. Treat the value as text (`textContent`, escaped templates)
2. Or pass it through a real sanitizer **then** into HTML
3. Or don’t put it there (use an `id` lookup, not a string of markup)

---

## 7. Defense in depth (locks that stack)

**1. Encode / use text APIs** — the real fix  
Output encoding at the last moment, for the right context.

**2. Content-Security-Policy** — the seatbelt  
`default-src 'self'` plus no `'unsafe-inline'` makes *inline* scripts from injected markup much harder. You need nonces or hashes for the scripts you *do* want. CSP does not replace encoding; it limits damage if encoding fails.

**3. Cookie flags** — reduce theft, not actions  
`HttpOnly`, `Secure`, `SameSite`. XSS can still click the UI as the user.

**4. Trusted Types (modern browsers)** — make sinks loud  
The DOM refuses string→HTML unless a policy says so. Forces you off `innerHTML`.

**5. Don’t reflect request bytes into HTML**  
Search terms, names, errors: same encoding rules.

Input validation (“must be an email”) is good product hygiene. It is **not** XSS defense. A valid email can still break out of an attribute if you concatenate.

---

## 8. What the demo is teaching

The code example is a **guestbook**:

- POST stores `{ author, text }` as JSON data
- GET returns JSON
- The page creates DOM nodes with **`textContent`**
- A debug line shows the **HTML-escaped** form (`&lt;` etc.) so you can see encoding
- The server sends a **CSP** that forbids surprise inline scripts

Type characters that *look* like HTML. They must stay characters.

That path is the XSS mental model: **store data, render as text, let CSP back you up**.

This pack does not include a “break the page” lab. The skill is recognizing the sink and choosing the text API.

---

## 9. XSS vs the cousins (so you don’t mix them)

| Bug | What went wrong |
|---|---|
| XSS | Browser runs attacker text **on your origin** |
| CSRF | Other origin **triggers** a cookie-backed action; they usually **cannot read** the page |
| Injection | SQL/shell ran attacker text; the **database/OS** is the interpreter |
| Open redirect | You send the user to a URL they chose; phishing, not script on your origin |

`SameSite` cookies help CSRF. They do **not** help XSS. The script is already on your site.

---

## 10. Common mistakes

1. **Blacklists** — removing `<script>` loses to the next encoding and the next tag  
2. **Encoding too early** — stored `&lt;b&gt;` double-encodes or is decoded then parsed later  
3. **Encoding in the wrong context** — HTML-escaping inside a JS string is still a JS problem  
4. **“We use React”** — `{data}` is safe; `dangerouslySetInnerHTML` and `href={userUrl}` are not automatic  
5. **CSP with `'unsafe-inline'`** — you kept the hole  
6. **Fixing only stored XSS** — reflected and DOM sinks remain  
7. **Thinking JSON APIs cannot XSS** — the SPA is still a browser document

---

## 11. Full picture in one diagram

```text
Author types comment
        │
        ▼
   POST JSON  ──►  store as data (not HTML)
        │
        ▼
   GET JSON   ──►  client
        │
        ├── textContent / escaped template  →  letters on screen
        └── innerHTML / string HTML         →  browser parses code
                    │
                    ▼
              attacker script on your origin
              (session, DOM, API calls)
```

Your job when learning XSS:
1. Treat the browser as an **interpreter**
2. Label every string as **data** until a sanitizer says otherwise
3. Match **encoding to context**
4. Prefer **`textContent`**
5. Add **CSP** as a seatbelt, not as the only lock

---

## 12. Mini glossary

- **XSS**: untrusted text executed as HTML/JS on your origin
- **Stored / reflected / DOM-based**: how the text arrived at the sink
- **Sink**: API that parses or runs a string (`innerHTML`, `eval`, …)
- **Context**: HTML vs attribute vs JS vs URL — encoding differs
- **Output encoding**: making a string safe *for that context*
- **Sanitizer**: allowlisted HTML for rich text (not a regex)
- **CSP**: policy for what the page may load and run
- **HttpOnly**: JS cannot read that cookie (XSS can still use the session via requests)

---

## 13. What “good understanding” looks like

You understand XSS when you can answer:

1. Why does the browser running script on your origin beat CORS?
2. Why is stripping tags the wrong model?
3. Why does `textContent` close the HTML-body case?
4. Why is CSP a seatbelt, not the fix?
5. Why doesn’t `SameSite` stop XSS?

If those answers are clear, your mental model is solid.

---

## Next step

Open:
- `03-code-example/` and run the comment wall
- Post text that looks like markup — it should **display as letters**
- Read `escapeHtml` and the `textContent` render path — that is the defense
