# Demystifying the MCP Directory: Giving AI Superpowers via Model Context Protocol

Have you ever wondered how AI assistants (like Claude, Cursor, or ChatGPT) go beyond text generation to fetch real-world hotel locations, check local weather warnings, or run custom tools?

Enter **MCP**—the **Model Context Protocol**.

In this repository, the `MCP/` directory holds custom lightweight servers that connect AI assistants directly to live data APIs. Let’s break down what’s inside, how it works, and how to debug it using the **MCP Inspector**!

---

## 💡 What is MCP in Plain English?

Think of Large Language Models (LLMs) as super-smart brains floating in a room with **no internet connection**. They can write poetry, refactor code, and answer history questions, but they can't tell you if it's currently raining in New York or find available hotels in London right now.

**MCP acts as a universal adapter plug (like USB-C for AI).** It lets an AI assistant talk to local servers and say:
> *"Hey, can you search for hotel locations or grab weather alerts for me?"*

The local MCP server makes the web request, gets the real-time data, and hands it back to the AI seamlessly.

---

## 📂 Inside the `MCP/` Folder

Inside our `MCP/` directory, you'll find two standalone TypeScript projects:

```text
MCP/
├── Code/                   👉 Nominatim / Location & Hotel Search Server
│   └── src/index.ts
└── Code2_weather/          👉 NWS Weather & Alerts Server
    └── src/index.ts
```

---

### 1. `MCP/Code/` — Hotel & Location Search Server 🏨

This server connects your AI directly to **OpenStreetMap’s Nominatim API**.

* **Tool Registered:** `search_hotels`
* **What it does:** When you ask your AI assistant to look up a hotel or place by name, the AI triggers this tool.
* **How it works:**
  1. Takes a search query parameter (e.g., `"Hilton downtown"`).
  2. Queries `https://nominatim.openstreetmap.org/search`.
  3. Formats the raw JSON map coordinates & address details and passes them right back to the AI.

---

### 2. `MCP/Code2_weather/` — Real-Time Weather & Alerts Server 🌤️

This project is a full **National Weather Service (NWS)** integration.

* **Tools Registered:**
  1. `get-alerts`: Fetches active severe weather warnings for any US state (e.g., `"CA"`, `"NY"`).
  2. `get-forecast`: Takes exact latitude & longitude coordinates and returns a multi-day forecast complete with temperatures, wind speed, and weather descriptions.
* **How it works:**
  1. Queries the official US government weather API (`api.weather.gov`).
  2. Formats geo-json weather data into clean, readable text summaries.
  3. Enables your AI to provide real-time weather forecasts directly inside your chat session!

---

## 🔍 Debugging & Testing with MCP Inspector

How do you know if your MCP tools are working before hooking them up to an AI like Cursor or Claude? 

You use the official **MCP Inspector** (`@modelcontextprotocol/inspector`)!

The MCP Inspector is a visual developer tool that runs a web UI in your browser. It connects directly to your MCP server over `stdio` and lets you inspect tools, view JSON schemas, and test tool executions manually without spending AI tokens.

### How to Run the Inspector:

1. **Build your project:**
   ```bash
   cd MCP/Code
   pnpm run build
   ```

2. **Launch the Inspector:**
   ```bash
   npx @modelcontextprotocol/inspector node build/index.js
   ```

3. **Debug in Browser:**
   - Open the URL printed in your terminal (usually `http://localhost:5173`).
   - Click on the **Tools** tab to list all available tools (`search_hotels`, `get-forecast`, `get-alerts`).
   - Enter mock input values (e.g. `name: "Marriott"`) and click **Run Tool**.
   - Inspect stdout, stderr, raw JSON payloads, and network logs in real-time!

---

## ⚙️ How It All Runs Together

We've configured `.cursor/mcp.json` and helper scripts (`scripts/run-mcp.sh`) so that **both servers can run simultaneously**.

When you chat with your AI assistant in Cursor or Claude Desktop:
1. The AI discovers the available tools across both servers.
2. If you ask: *"What's the weather in San Francisco and are there any hotel spots nearby?"*, the AI calls **both** MCP tools automatically in parallel.
3. You get a single, unified, real-time response!

---

## 🎯 Summary

The `MCP/` folder is where **static AI becomes dynamic and context-aware**. By standardizing communication over `stdio` via `@modelcontextprotocol/sdk` and validating with the **MCP Inspector**, you can rapidly build, test, and ship tools that turn any LLM into an interactive powerhouse!
