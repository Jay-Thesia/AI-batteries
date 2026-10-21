# LinkedIn Post — XSS

---

## Ready-to-post version

Spent some time revisiting XSS — not the scanner findings, the browser model.

Most teams don’t struggle with “don’t trust users.” They struggle with the shift in thinking:

The browser’s job is to parse HTML and run JS **on your origin**.  
XSS is when **someone else’s string** is fed into that job as if it were your markup.

That single change explains the real work:

• Delivery path (stored, reflected, DOM) is just how the string arrived  
• The bug is the **sink** — `innerHTML`, string-built HTML, `eval`, bad templates  
• Encoding must match **context** (body vs attribute vs JS vs URL)  
• `textContent` is the default; sanitizers are for rich text, not regex tag filters  
• CSP is a seatbelt. HttpOnly helps theft, not “script can still click as the user”  

XSS is not CSRF. CSRF rides a cookie from another site. XSS *is* your site.

If you’re fixing it: label data as data at the DOM. Framework last. Word filters never.

#XSS #AppSec #WebSecurity #FrontendEngineering

---

## Optional shorter version

Revisiting XSS with a stricter lens:

It’s less about “strip script tags” and more about the browser as an interpreter.

Untrusted string + HTML/JS sink = their code on your origin.

Default: `textContent`  
Rich text: a real sanitizer  
CSP: seatbelt  

SameSite does not save you here. The script is already home.

#XSS #AppSec #WebSecurity
