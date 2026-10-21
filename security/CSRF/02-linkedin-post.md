# LinkedIn Post — CSRF

---

## Ready-to-post version

Spent some time revisiting CSRF — not the acronym, the cookie model.

Most teams don’t struggle with “use a token.” They struggle with the shift in thinking:

HTTP cookies are **ambient**. The browser attaches them to requests to your origin without your JavaScript asking.  
Your server treats that as “the user meant this.” That is only true when **your UI** started the request.

That single change explains the real work:

• CSRF is authentication without intent — another site caused the request; the cookie still went  
• CORS mostly blocks *reads* from JS. It does not mean the browser cannot *send*  
• A CSRF token is a secret SOP stops the other origin from reading  
• `SameSite=Lax` is a huge seatbelt on cookies; it is not the only lock  
• XSS bypasses CSRF defenses — the script already is your page and can read the token  

CSRF is not XSS. XSS runs on your origin. CSRF rides a cookie from the street.

If you’re fixing it: prove intent on every cookie-backed write. Framework last. “We have CORS” never.

#CSRF #AppSec #WebSecurity #BackendEngineering

---

## Optional shorter version

Revisiting CSRF with a stricter lens:

It’s less about “add a hidden field” and more about cookies ≠ clicks.

Session answers who.  
Token / Origin / SameSite answer “did *our* page mean it.”

CORS does not replace that. XSS eats it.

#CSRF #AppSec #WebSecurity
