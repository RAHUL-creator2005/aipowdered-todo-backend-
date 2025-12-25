// MCP Server Implementation
// This is a simplified MCP server for the AI todo system
import { todoTools } from "./todo.tools.js";

// Tool registry and execution
class SimpleMCPServer {
  constructor() {
    this.tools = new Map();
    this.registerTools();
  }

  registerTools() {
    todoTools.forEach(tool => {
      this.tools.set(tool.name, tool);
    });
  }

  getTool(name) {
    return this.tools.get(name);
  }

  async executeTool(toolName, input, context) {
    const tool = this.getTool(toolName);
    if (!tool) {
      throw new Error(`Tool '${toolName}' not found`);
    }

    // Validate input using zod schema
    const validationResult = tool.inputSchema.safeParse(input);
    if (!validationResult.success) {
      throw new Error(`Invalid input for tool '${toolName}': ${validationResult.error.message}`);
    }

    // Pass both validated input and context to handler
    return await tool.handler(validationResult.data, context);
  }

  async start() {
    // MCP Server started successfully
  }
}

const mcpServer = new SimpleMCPServer();

// Export functions for backward compatibility
export const executeTool = (toolName, input, context) => mcpServer.executeTool(toolName, input, context);
export const validateToolInput = (toolName, input) => {
  const tool = mcpServer.getTool(toolName);
  if (!tool) return false;
  return tool.inputSchema.safeParse(input).success;
};

// Start function for server initialization
async function startMCP() {
  await mcpServer.start();
}

export default startMCP;

