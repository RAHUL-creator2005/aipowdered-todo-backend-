# OpenAI Integration Setup Guide

## 🚀 **OpenAI AI Service Successfully Integrated!**

Your backend now uses **OpenAI Chat API** instead of Google Gemini for command processing.

## 📋 **Setup Instructions:**

### **1. Get OpenAI API Key:**
1. Go to: https://platform.openai.com/api-keys
2. Create a new API key
3. Copy the key (starts with `sk-`)

### **2. Create `.env` File:**
Create a file named `.env` in the `backend/` directory:

```env
# OpenAI API Configuration
OPENAI_API_KEY=sk-your-actual-api-key-here

# Database Configuration
MONGODB_URI=mongodb+srv://rahulkeerthivasan61_db_user:rahul1234@cluster3todoapp.7iqgqtv.mongodb.net/

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### **3. Test the Integration:**

Run the test script:
```bash
cd backend
node test-openai.js
```

### **4. Start the Server:**

```bash
cd backend
node server.js
```

---

## 🔧 **Files Created/Modified:**

### **New Files:**
- `backend/ai/ai.service.js` - OpenAI service with command processing
- `backend/test-openai.js` - Test script for OpenAI integration

### **Modified Files:**
- `backend/controllers/ai.controller.js` - Updated to use OpenAI instead of Gemini
- `backend/package.json` - Added `openai` and `axios` dependencies

---

## 🎯 **How It Works:**

1. **User sends message** (e.g., "/add buy milk")
2. **OpenAI processes** the command and returns JSON:
   ```json
   {
     "tool": "add_todo",
     "input": { "text": "buy milk" }
   }
   ```
3. **MCP executes** the appropriate tool
4. **Database updates** with user-scoped todos
5. **Response sent** back to frontend

---

## 🧪 **Supported Commands:**

- `/add <todo_text>` → `add_todo` tool
- `/show` → `get_todos` tool
- `/delete <todo_text>` → `delete_todo` tool
- Any other message → Falls back to `get_todos`

---

## 🔍 **Testing Commands:**

```bash
# Test connection
node test-openai.js

# Manual testing
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"message": "/add buy groceries"}'
```

---

## 🚨 **Troubleshooting:**

### **"OPENAI_API_KEY is missing"**
- ✅ Check if `.env` file exists in `backend/` folder
- ✅ Verify API key starts with `sk-`
- ✅ Restart server after adding API key

### **"API quota exceeded"**
- ✅ Check OpenAI billing at https://platform.openai.com/usage
- ✅ Upgrade plan if needed

### **"Invalid API key"**
- ✅ Regenerate API key at https://platform.openai.com/api-keys
- ✅ Make sure it's the secret key, not the public key

---

## 💡 **Advanced Features:**

### **Using GPT-4 Instead of GPT-3.5:**
Edit `backend/ai/ai.service.js` line 59:
```javascript
model: "gpt-4", // Instead of "gpt-3.5-turbo"
```

### **Custom Prompts:**
Modify the `SYSTEM_PROMPT` in `ai.service.js` to customize AI behavior.

### **Error Handling:**
All errors are caught and returned as user-friendly messages.

---

## 🎉 **Ready to Use!**

Once you add your OpenAI API key to the `.env` file, your AI-powered todo app will be fully functional with OpenAI's advanced language processing! 🤖✨
