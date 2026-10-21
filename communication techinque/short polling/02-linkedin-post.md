# LinkedIn Post — Short Polling

---

## Ready-to-post version

Spent some time revisiting short polling — not as a joke, as a delivery contract.

Most teams don’t struggle with `setInterval`. They struggle with the shift in thinking:

A poll is not “refresh the page.”  
A poll is “give me the delta since my cursor, and answer **now**, even if the delta is empty.”

That single rule explains the design:

• Empty HTTP 200s are the common case, not a bug  
• Perceived latency is dominated by the interval, not the network  
• QPS ≈ clients / interval — most of it is “no news”  
• Overlapping timers are worse than a slightly slower loop  

Short polling is not obsolete. It’s a stronger fit when a few seconds of delay is acceptable, events are rare, and you want stateless HTTP you already know how to operate.

If you’re using it: cursor first. Interval second. “Real-time” branding last.

#SystemDesign #BackendEngineering #HTTP #SoftwareArchitecture

---

## Optional shorter version

Revisiting short polling with a stricter lens:

It’s less about “keep calling the API” and more about bounded delay.

Timer = clock  
Cursor = resume point  
Empty 200 = success with no news

Use it when late-by-seconds is still correct. When it isn’t, you wanted a held request or a socket.

#SystemDesign #HTTP
