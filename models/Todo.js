import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Todo text is required'],
    trim: true,
    maxlength: [200, 'Todo text cannot exceed 200 characters']
  },
  completed: {
    type: Boolean,
    default: false
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Todo must belong to a user']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
todoSchema.index({ user: 1, createdAt: -1 });

// Virtual for formatted creation date
todoSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString();
});

// Static method to get user's todos
todoSchema.statics.getUserTodos = function(userId) {
  return this.find({ user: userId }).sort({ createdAt: -1 });
};

// Static method to add todo for user
todoSchema.statics.addUserTodo = function(userId, text) {
  return this.create({
    text: text.trim(),
    user: userId
  });
};

// Instance method to toggle completion
todoSchema.methods.toggleComplete = function() {
  this.completed = !this.completed;
  return this.save();
};

export default mongoose.model('Todo', todoSchema);
