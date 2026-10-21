# LinkedIn Post — Web Security Attacks

---

## Ready-to-post version

Spent some time separating two ideas teams mash together: **API design** and **web attacks**.

REST / GraphQL / gRPC answer: “What does the message look like?”  
Polling / WebSockets answer: “How does the client find out something changed?”  
Security attacks answer: “Who did we accidentally trust?”

That split explains the acronym soup:

• XSS — untrusted text is parsed as HTML/JS on your origin  
• CSRF — another site triggers a request; the browser still attaches the cookie  
• Injection — data is concatenated into SQL / shell / another interpreter  
• SSRF — your server fetches a URL the attacker chose (often inside the firewall)  
• IDOR — “this id exists” is treated as “this user may see it”  

The product can stay the same. A comment box, a delete button, and a “preview this link” feature are enough to hit three different trust bugs.

If you’re reviewing a web app: name the interpreter first (browser, database, HTTP client). Schema second. Scanner last.

#AppSec #WebSecurity #XSS #CSRF #BackendEngineering

---

## Optional shorter version

Revisiting web attacks with a stricter lens:

It’s less about memorizing OWASP names and more about trust mix-ups.

XSS = the page runs a stranger’s writing  
CSRF = the server thinks you clicked  
Injection = the database thinks data is a command  
SSRF = your server knocks on a door you shouldn’t  
IDOR = the lock checked the number, not the owner

Same product. Different interpreter. Encode data. Authorize objects.

#AppSec #WebSecurity #SoftwareEngineering
