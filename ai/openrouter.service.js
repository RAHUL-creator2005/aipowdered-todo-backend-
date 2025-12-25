import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * OpenRouter Service for command-based todo interactions
 * Alternative to OpenAI - supports multiple AI models
 */

// Get OpenRouter API key from environment
const getApiKey = () => {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is missing in environment variables');
  }

  if (!apiKey.startsWith('sk-or-v1-') || apiKey.length < 20) {
    throw new Error('OPENROUTER_API_KEY appears to be invalid (should start with "sk-or-v1-")');
  }

  return apiKey;
};

/**
 * Test connection to OpenRouter API
 */
export const testConnection = async () => {
  try {
    const apiKey = getApiKey();

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: "microsoft/wizardlm-2-8x22b",
      messages: [
        {
          role: "user",
          content: "Hello"
        }
      ],
      max_tokens: 10
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'AI Todo App'
      }
    });

    return response.data.choices && response.data.choices.length > 0;
  } catch (error) {
    console.error('OpenRouter connection test failed:', error.message);
    return false;
  }
};

/**
 * Process user command and return JSON response for MCP tools
 */
export const processCommand = async (userMessage) => {
  try {
    const apiKey = getApiKey();

    const systemPrompt = `You are a command interpreter for a todo application. Your ONLY job is to parse user commands and respond with a JSON object indicating which tool to call.

Available commands:
- "/add <todo_text>" - Add a new todo item
- "/show" - Show all todo items
- "/delete <todo_text>" - Delete a todo item by its text

Your response MUST be valid JSON with this exact format:
{
  "tool": "add_todo" | "get_todos" | "delete_todo",
  "input": {
    "text": "<todo_text>"  // Only required for add_todo and delete_todo
  }
}

Rules:
1. ONLY respond with JSON - no explanations, no additional text
2. For "/add <text>" commands, use tool: "add_todo"
3. For "/show" commands, use tool: "get_todos"
4. For "/delete <text>" commands, use tool: "delete_todo"
5. Extract the todo text exactly as written by the user
6. If the command doesn't match any pattern, use tool: "get_todos" as fallback

Examples:
Input: "/add buy groceries"
Output: {"tool": "add_todo", "input": {"text": "buy groceries"}}

Input: "/show"
Output: {"tool": "get_todos", "input": {}}

Input: "/delete buy milk"
Output: {"tool": "delete_todo", "input": {"text": "buy milk"}}

Input: "hello"
Output: {"tool": "get_todos", "input": {}}`;

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: "microsoft/wizardlm-2-8x22b", // Good balance of speed and quality
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      temperature: 0.1, // Low temperature for consistent command parsing
      max_tokens: 200
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'AI Todo App'
      }
    });

    const content = response.data.choices[0]?.message?.content?.trim();

    if (!content) {
      throw new Error('No response from OpenRouter');
    }

    // Try to parse JSON response
    try {
      const parsed = JSON.parse(content);
      return parsed;
    } catch (parseError) {
      // Try to extract JSON from the response if it contains extra text
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const extractedJson = JSON.parse(jsonMatch[0]);
          return extractedJson;
        } catch (extractError) {
          // Fallback to show todos if parsing fails
          return {
            tool: 'get_todos',
            input: {}
          };
        }
      }

      // Fallback to show todos if parsing fails
      return {
        tool: 'get_todos',
        input: {}
      };
    }

  } catch (error) {
    console.error('OpenRouter API error:', error.message);

    // Return fallback response
    return {
      tool: 'get_todos',
      input: {}
    };
  }
};

/**
 * Send a chat message and get AI response
 */
export const sendChatMessage = async (message) => {
  try {
    const commandResult = await processCommand(message);

    // Validate the response structure
    if (!commandResult.tool || !['add_todo', 'get_todos', 'delete_todo'].includes(commandResult.tool)) {
      throw new Error('Invalid tool returned from AI');
    }

    return commandResult;
  } catch (error) {
    console.error('Error in sendChatMessage:', error.message);
    throw new Error('AI service temporarily unavailable. Please try again.');
  }
};
