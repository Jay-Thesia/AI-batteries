import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Create server instance
const server = new McpServer({
  name: "nominatim",
  version: "1.0.0",
});


server.registerTool("search_hotels", {
  title: "Search for hotels",
  description: "Search for hotels",
  inputSchema: {
    name: z.string().describe("The name of the hotel to search for"),
  }
}, async ({ name }) => {

try {
  // call the Nominatim API (https://nominatim.org/) to search for hotels
  const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(name)}&format=jsonv2`,{
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
  });

  console.error("📦 MCP status:", response.status, response.statusText);
console.error("📦 MCP ok:", response.ok);

  const data = await response.json();
  console.error("📦 MCP data:", JSON.stringify(data, null, 2));
  return {
    content: [{
      type: "text",
      text: JSON.stringify(data, null, 2)
    }]

    }
  } catch (error:any) {
    console.error("Error in search_hotels:", error);
    return {
      content: [{
        type: "text",
        text: "Error in search_hotels: " + error.message
      }]
    }
  }
})
// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Nominatim MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});