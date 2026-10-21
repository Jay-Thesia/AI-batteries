# Web security attacks — like explaining to a 5-year-old

You have a **clubhouse**.

Friends may come in. Strangers may shout from the street. Notes may be pinned on the wall.

Bad days happen when the clubhouse **mixes those up**.

### XSS — a note that the wall obeys
Someone pins a note. The wall should only *show* letters. If the wall *follows instructions* written on the note, the note-writer is running the clubhouse.

### CSRF — a fake “please do this” from a friend
A stranger on the street yells “bring me cookies!” in your friend’s voice. Mom thinks it was your friend, because your friend is already wearing the clubhouse bracelet.

### Injection — mixing homework with commands
You write a grocery list. If the shopkeeper treats “and also open the safe” as a real command mixed into the list, the list-writer is running the shop.

### SSRF — sending the clubhouse to knock for you
You are not allowed in the basement. You ask the clubhouse robot to “fetch that picture.” The robot *is* allowed in the basement — so you used the robot as a key.

### Clickjacking — a trick window
A clear sticker over the “open door” button. You think you tapped a game. You actually tapped the door.

### IDOR — looking in the wrong locker
Locker 12 is yours. If saying “I want locker 13” is enough, the lock never checked *whose* locker it was.

---

**That’s the whole family:**

- XSS: the page runs a stranger’s writing as code
- CSRF: the server thinks *you* clicked, but another site made the click
- Injection: data is treated as a query / command
- SSRF: your server fetches a URL the attacker chose
- Clickjacking: you click something you cannot see
- IDOR: the app checks “is this a valid id?” instead of “is this *your* id?”

REST / GraphQL / gRPC decide **what the message looks like**.  
Communication techniques decide **when it travels**.  
Security attacks are about **who the app trusts**.
