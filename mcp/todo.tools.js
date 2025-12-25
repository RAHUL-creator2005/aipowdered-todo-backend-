import { z } from "zod";
import * as todoController from "../controllers/todo.controller.js";

const todoTools = [
  {
    name: "add_todo",
    description: "Add a todo",
    inputSchema: z.object({
      text: z.string()
    }),
    handler: async ({ text }, context) => {
      const todo = await todoController.addTodo(context.userId, text);
      return { success: true, todo };
    }
  },

  {
    name: "get_todos",
    description: "Get all todos",
    inputSchema: z.object({}),
    handler: async (input, context) => {
      const todos = await todoController.getTodos(context.userId);
      return { todos };
    }
  },

  {
    name: "delete_todo",
    description: "Delete a todo",
    inputSchema: z.object({
      text: z.string()
    }),
    handler: async ({ text }, context) => {
      const todo = await todoController.deleteTodo(context.userId, text);
      return { success: true, todo };
    }
  }
];

export { todoTools };

