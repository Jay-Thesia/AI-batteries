# Nominatim MCP Server (Hotel Search)

A local [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server that exposes a `search_hotels` tool. It looks up hotels by name using the [Nominatim](https://nominatim.org/) geocoding API (OpenStreetMap data).

## Project layout

```
MCP/Code/
├── src/index.ts      # Server source (edit this)
├── build/index.js    # Compiled output (Cursor runs this)
├── package.json
├── tsconfig.json
└── README.md
```

Cursor config lives at the repo root:

```
.cursor/mcp.json
```

## Prerequisites

- **Node.js** 18+ (20+ recommended)
- **pnpm** (or npm)

If you use `nvm`, the repo also includes `scripts/run-mcp.sh` to load the correct Node version for Cursor.

## Setup

From the repo root:

```bash
cd MCP/Code
pnpm install
pnpm build
```

After every change to `src/index.ts`, rebuild:

```bash
pnpm build
```

Then restart the MCP server in Cursor (see below).

## Use in Cursor

### 1. MCP config

The project is already wired in `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "nominatim": {
      "command": "node",
      "args": ["MCP/Code/build/index.js"]
    }
  }
}
```

Paths are relative to the **project root** (`AI_Batteries/`).

### 2. Enable / restart the server

1. Open **Cursor Settings → MCP**
2. Confirm `nominatim` is listed and enabled
3. After code changes, click **Restart** on that server (or reload the window)

### 3. Call the tool from chat

Ask the agent to search for a hotel, for example:

- *"Search for Hilton Paris using my local MCP"*
- *"Use search_hotels for Marriott London"*

The agent will call the `search_hotels` tool with a `name` argument.

### Alternative: run TypeScript directly (no build step)

Useful while iterating quickly. Update `.cursor/mcp.json` to:

```json
{
  "mcpServers": {
    "nominatim": {
      "command": "bash",
      "args": ["./scripts/run-mcp.sh", "MCP/Code/src/index.ts"]
    }
  }
}
```

Run from the **repo root** so the script path resolves correctly.

## Available tools

### `search_hotels`

Search for a hotel by name.

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | yes | Hotel name to search (e.g. `"Hilton Paris"`) |

**Example result fields** (from OpenStreetMap via Nominatim):

- `name` — place name
- `display_name` — full address string
- `lat`, `lon` — coordinates
- `type`, `category` — usually `hotel` / `tourism`
- `boundingbox` — approximate map bounds

## Test with MCP Inspector (recommended)

The [MCP Inspector](https://github.com/modelcontextprotocol/inspector) lets you invoke tools and see server logs in the terminal.

From `MCP/Code`:

```bash
pnpm build
npx @modelcontextprotocol/inspector node build/index.js
```

1. Open the URL printed in the terminal (usually `http://localhost:6274`)
2. Connect to the server
3. Open the **Tools** tab
4. Run `search_hotels` with `{ "name": "Hilton Paris" }`
5. Watch the terminal for stderr logs (`📦 MCP status`, `📦 MCP data`, etc.)

### Log fetch output to a file

```bash
pnpm build
node build/index.js 2> mcp-server.log
```

In another terminal:

```bash
tail -f mcp-server.log
```

Then trigger the tool from Inspector or Cursor.

> Only run one instance at a time on the same stdio transport, or logs can be confusing.

## View logs in Cursor

Server logs use `console.error()` (stderr). stdout is reserved for MCP protocol messages.

To see logs while using Cursor:

1. **View → Output** (`Cmd+Shift+U` on macOS)
2. Select **MCP** or **MCP Logs** in the dropdown
3. Trigger a tool call and look for lines starting with `📦`

## Quick API test (without MCP)

To verify [Nominatim](https://nominatim.org/) connectivity only:

```bash
node -e "
const name = 'Hilton Paris';
fetch('https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(name) + '&format=jsonv2', {
  headers: { 'User-Agent': 'NominatimMCP/1.0 (local-test)' }
})
  .then(r => { console.log('status', r.status); return r.json(); })
  .then(d => console.log(JSON.stringify(d, null, 2)))
  .catch(e => console.error(e));
"
```

## Troubleshooting

### `fetch failed`

Network-level error before any HTTP response (DNS, timeout, connection reset). Often transient on the first call. Retry the tool; if it persists, check internet access and [Nominatim](https://nominatim.org/) status.

This is **not** the same as HTTP 403/404.

### HTTP 403 from Nominatim

Nominatim requires a valid `User-Agent` header. The server sets one in `src/index.ts`. Do not remove it.

### `📦 MCP response: {}` in logs

Do **not** log the raw `fetch` `Response` object — it serializes as `{}`. Log specific fields instead:

```ts
console.error("📦 MCP status:", response.status, response.statusText);
const data = await response.json();
console.error("📦 MCP data:", JSON.stringify(data, null, 2));
```

### Changes not taking effect in Cursor

Cursor runs `MCP/Code/build/index.js`, not `src/index.ts`. Always run:

```bash
pnpm build
```

Then restart the MCP server in Cursor settings.

### Tool works in Inspector but not in Cursor

- Confirm `.cursor/mcp.json` path is correct relative to project root
- Restart the MCP server after config changes
- Check **Output → MCP Logs** for startup errors

## npm scripts

| Command | Description |
|---------|-------------|
| `pnpm install` | Install dependencies |
| `pnpm build` | Compile `src/` → `build/` |
| `pnpm start` | Run server with `tsx` (manual / debugging) |

## External API usage

This server calls the public Nominatim search API:

```
GET https://nominatim.openstreetmap.org/search?q=<name>&format=jsonv2
```

Docs: [nominatim.org](https://nominatim.org/) · [API documentation](https://nominatim.org/release-docs/develop/api/Overview/)

Please follow the [Nominatim usage policy](https://operations.osmfoundation.org/policies/nominatim/): avoid heavy or automated bulk requests, use a descriptive `User-Agent`, and cache results if you extend this project.

## Related files in this repo

| Path | Purpose |
|------|---------|
| `.cursor/mcp.json` | Cursor MCP server registration |
| `scripts/run-mcp.sh` | Launcher that loads nvm and runs entry via `tsx` |
| `MCP/Code2_calculator/` | Separate example MCP server (weather tools) |
