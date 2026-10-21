# LinkedIn Post — gRPC

---

## Ready-to-post version

Spent some time revisiting gRPC fundamentals today — not the tooling, the contract model.

Most teams don’t struggle with spinning up a server. They struggle with the shift in thinking:

REST asks: “Which resource lives at this URL?”  
GraphQL asks: “What graph of data does this screen need?”  
gRPC asks: “Which remote procedure am I calling, with which typed message?”

That single framing explains most of the design decisions:

• `.proto` becomes the cross-language product contract  
• Protobuf makes payloads typed and compact — not hand-shaped JSON  
• HTTP/2 unlocks multiplexing and first-class streaming  
• Unary is only one mode — server, client, and bidirectional streams are part of the model

gRPC is not a default replacement for REST/GraphQL at the public edge. It’s a stronger fit for service-to-service communication, polyglot platforms, low-latency internal APIs, and workloads that need streaming with strong contracts.

If you’re adopting it: design the service methods and messages first. Codegen second. Clever custom framing last.

#gRPC #Protobuf #APIDesign #BackendEngineering #SoftwareArchitecture

---

## Optional shorter version

Revisiting gRPC with a stricter lens:

It’s less about “faster JSON” and more about making remote function calls explicit.

`.proto` = contract  
Protobuf = typed efficient messages  
RPC kinds = unary or streams over HTTP/2

Use it when services need strong multi-language contracts and streaming. For browser-public resource APIs, REST/GraphQL still earn their place.

#gRPC #APIDesign
