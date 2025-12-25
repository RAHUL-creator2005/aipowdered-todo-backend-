import OpenAI from 'openai';
import axios from 'axios';

/**
 * OpenAI Service for command-based todo interactions
 * Handles user messages and returns structured JSON responses for MCP tools
 */

// Initialize OpenAI client with API key from environment
const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is missing in environment variables');
  }

  if (!apiKey.startsWith('sk-') || apiKey.length < 20) {
    throw new Error('OPENAI_API_KEY appears to be invalid (should start with "sk-")');
  }

  return new OpenAI({
    apiKey: apiKey,
  });
};

/**
 * System prompt for OpenAI to ensure JSON-only responses for todo commands
 */
const SYSTEM_PROMPT = `You are a command interpreter for a todo application. Your ONLY job is to parse user commands and respond with a JSON object indicating which tool to call.

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
7. Never add extra properties or explanations

Examples:
Input: "/add buy milk"
Output: {"tool": "add_todo", "input": {"text": "buy milk"}}

Input: "/show"
Output: {"tool": "get_todos", "input": {}}

Input: "/delete buy milk"
Output: {"tool": "delete_todo", "input": {"text": "buy milk"}}

Input: "hello"
Output: {"tool": "get_todos", "input": {}}`;

/**
 * Send user message to OpenAI and get structured JSON response
 * @param {string} userMessage - The user's command/message
 * @returns {Promise<Object>} - Parsed JSON with tool and input
 */
export const processCommand = async (userMessage) => {
  try {
    const client = getOpenAIClient();

    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      temperature: 0.1, // Low temperature for consistent command parsing
      max_tokens: 150,  // Limit response length
      response_format: { type: "json_object" } // Force JSON response
    });

    const responseText = completion.choices[0]?.message?.content?.trim();

    if (!responseText) {
      throw new Error('No response received from OpenAI');
    }

    // Parse the JSON response
    const parsedResponse = JSON.parse(responseText);

    // Validate the response structure
    if (!parsedResponse.tool) {
      throw new Error('OpenAI response missing required "tool" field');
    }

    if (!['add_todo', 'get_todos', 'delete_todo'].includes(parsedResponse.tool)) {
      throw new Error(`Invalid tool: ${parsedResponse.tool}`);
    }

    if (!parsedResponse.input || typeof parsedResponse.input !== 'object') {
      throw new Error('OpenAI response missing or invalid "input" field');
    }

    return parsedResponse;

  } catch (error) {
    console.error('❌ OpenAI Service Error:', error.message);

    // Handle different types of errors
    if (error.message.includes('OPENAI_API_KEY')) {
      throw new Error('OpenAI API key is invalid or missing');
    } else if (error.code === 'insufficient_quota') {
      throw new Error('OpenAI API quota exceeded. Please check your billing');
    } else if (error.code === 'invalid_api_key') {
      throw new Error('OpenAI API key is invalid');
    } else if (error.code === 'model_not_found') {
      throw new Error('OpenAI model not available. Please check model name');
    } else if (error.message.includes('JSON')) {
      throw new Error('OpenAI returned invalid JSON. Please try again');
    } else if (error.message.includes('network') || error.code === 'ECONNREFUSED') {
      throw new Error('Network error: Unable to connect to OpenAI API');
    } else {
      throw new Error('AI service temporarily unavailable. Please try again');
    }
  }
};

/**
 * Alternative implementation using axios instead of OpenAI SDK
 * Uncomment to use this instead of the SDK version above
 */
/*
export const processCommandWithAxios = async (userMessage) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is missing in environment variables');
    }

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT
          },
          {
            role: "user",
            content: userMessage
          }
        ],
        temperature: 0.1,
        max_tokens: 150,
        response_format: { type: "json_object" }
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      }
    );

    const responseText = response.data.choices[0]?.message?.content?.trim();

    if (!responseText) {
      throw new Error('No response received from OpenAI');
    }

    return JSON.parse(responseText);

  } catch (error) {
    console.error('❌ OpenAI Axios Error:', error.response?.data || error.message);

    if (error.response?.status === 401) {
      throw new Error('OpenAI API key is invalid');
    } else if (error.response?.status === 429) {
      throw new Error('OpenAI API rate limit exceeded. Please try again later');
    } else if (error.response?.status === 500) {
      throw new Error('OpenAI server error. Please try again later');
    } else {
      throw new Error('AI service temporarily unavailable. Please try again');
    }
  }
};
*/

/**
 * Test the OpenAI service connection
 * @returns {Promise<boolean>} - True if connection is successful
 */
export const testConnection = async () => {
  try {
    const client = getOpenAIClient();

    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Respond with 'OK' if you can read this." },
        { role: "user", content: "test" }
      ],
      max_tokens: 10
    });

    return completion.choices[0]?.message?.content ? true : false;
  } catch (error) {
    console.error('OpenAI connection test failed:', error.message);
    return false;
  }
};

/**
 * Test example usage
 */
/*
import { processCommand, testConnection } from './ai.service.js';

async function testExample() {
  console.log('🧪 Testing OpenAI Service');
  console.log('========================');

  // Test connection
  console.log('1. Testing connection...');
  const connected = await testConnection();
  console.log('Connection:', connected ? '✅ SUCCESS' : '❌ FAILED');

  if (connected) {
    // Test commands
    const testCommands = [
      '/add buy groceries',
      '/show',
      '/delete buy milk',
      'hello world'
    ];

    for (const command of testCommands) {
      console.log(`\n2. Testing command: "${command}"`);
      try {
        const result = await processCommand(command);
        console.log('✅ Response:', JSON.stringify(result, null, 2));
      } catch (error) {
        console.log('❌ Error:', error.message);
      }
    }
  }
}

// Run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testExample().catch(console.error);
}
*/

export default {
  processCommand,
  testConnection
};
