import { processCommand } from '../ai/openrouter.service.js';
import { executeTool, validateToolInput } from '../mcp/mcpServer.js';

/**
 * Handle AI chat requests
 * @route POST /api/ai/chat
 * @access Private (JWT required)
 */
const handleChat = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id; // From JWT middleware

    // Validate input
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Message is required and must be a string'
      });
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty'
      });
    }

    // Send command to OpenRouter
    let aiResponse;
    try {
      aiResponse = await processCommand(trimmedMessage);
    } catch (aiError) {
      console.error('OpenRouter error:', aiError);
      return res.status(500).json({
        success: false,
        message: 'AI service temporarily unavailable. Please try again.',
        error: 'AI_SERVICE_ERROR'
      });
    }

    // Validate OpenRouter response
    if (!aiResponse.tool) {
      return res.status(500).json({
        success: false,
        message: 'Invalid AI response format. Please try again.',
        error: 'INVALID_AI_RESPONSE'
      });
    }

    // Validate tool input
    if (!validateToolInput(aiResponse.tool, aiResponse.input || {})) {
      return res.status(400).json({
        success: false,
        message: 'Invalid command format. Please use: /add <todo>, /show, or /delete <todo>',
        error: 'INVALID_TOOL_INPUT'
      });
    }

    // Execute the MCP tool
    const context = { userId };
    let toolResult;

    try {
      toolResult = await executeTool(aiResponse.tool, aiResponse.input || {}, context);
    } catch (toolError) {
      return res.status(500).json({
        success: false,
        message: 'Failed to execute command. Please try again.',
        error: 'TOOL_EXECUTION_ERROR'
      });
    }

    // Format success message based on tool type
    let responseMessage = '';

    if (aiResponse.tool === 'add_todo') {
      responseMessage = '✅ Todo added successfully!';
    } else if (aiResponse.tool === 'get_todos') {
      const todos = toolResult.todos || [];
      const todoCount = todos.length;
      if (todoCount === 0) {
        responseMessage = '📋 You have no todos yet!';
      } else {
        responseMessage = `📋 You have ${todoCount} todo${todoCount !== 1 ? 's' : ''}:\n${todos.map((todo, index) => `${index + 1}. ${todo.text}`).join('\n')}`;
      }
    } else if (aiResponse.tool === 'delete_todo') {
      responseMessage = '🗑️ Todo deleted successfully!';
    } else {
      responseMessage = '✅ Command executed successfully!';
    }

    // Return success response with message
    res.status(200).json({
      success: true,
      message: responseMessage,
      data: toolResult,
      tool: aiResponse.tool,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI chat controller error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
      error: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Get chat history (placeholder for future implementation)
 * @route GET /api/ai/history
 * @access Private (JWT required)
 */
const getChatHistory = async (req, res) => {
  try {
    // Placeholder - implement chat history storage later
    res.status(200).json({
      success: true,
      message: 'Chat history feature coming soon',
      data: {
        history: [],
        count: 0
      }
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chat history'
    });
  }
};

export {
  handleChat,
  getChatHistory
};
