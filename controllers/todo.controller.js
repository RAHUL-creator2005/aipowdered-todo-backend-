import Todo from "../models/Todo.js";

// Add Todo
export const addTodo = async (userId, text) => {
  const todo = await Todo.create({
    user: userId,
    text
  });
  return todo;
};

// Get Todos
export const getTodos = async (userId) => {
  return await Todo.find({ user: userId }).sort({ createdAt: -1 });
};

// Delete Todo
export const deleteTodo = async (userId, text) => {
  const deleted = await Todo.findOneAndDelete({
    user: userId,
    text
  });

  if (!deleted) {
    throw new Error("Todo not found");
  }

  return deleted;
};
