import mongoose from 'mongoose';

// Connect to MongoDB
const connectDB = async (mongoURI) => {
  try {
    // Use provided URI or fall back to environment variable or default
    const connectionURI = mongoURI || process.env.MONGODB_URI || 'mongodb://localhost:27017/aipoweredtodo';

    const conn = await mongoose.connect(connectionURI);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

export default connectDB;
