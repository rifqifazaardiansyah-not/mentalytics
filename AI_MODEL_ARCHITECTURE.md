# 🤖 AI Model Architecture - Hybrid Model Switching

## 📋 Overview

Chatbot Mentalytics menggunakan **Hybrid Model Switching Strategy** untuk mengoptimalkan:
- ⚡ **Latency** (kecepatan respons)
- 💰 **Cost** (efisiensi token)
- 🎯 **Quality** (akurasi reasoning)
- 📊 **Rate Limits** (kapasitas tinggi)

---

## 🔀 Model Configuration

### **Available Models**

| Model | Use Case | Speed | Capability | Rate Limit |
|-------|----------|-------|------------|------------|
| **gemini-3.5-flash-lite** | Default, high-traffic text conversations | ⚡⚡⚡ Ultra-fast | Basic reasoning | High RPM |
| **gemini-3.6-flash** | Complex reasoning, multimodal tasks | ⚡⚡ Fast | Advanced reasoning | Medium RPM |
| **gemini-2.5-flash** | Emergency fallback | ⚡ Standard | Good reasoning | Medium RPM |

### **Current Configuration**

```javascript
const MODEL_CONFIG = {
  LITE: 'gemini-3.5-flash-lite',     // Default for normal conversations
  FLASH: 'gemini-3.6-flash',         // Complex tasks, multimodal
  FALLBACK: 'gemini-2.5-flash'       // Emergency backup
}
```

---

## 🎯 Auto-Switching Logic

### **When to Use LITE Model** (gemini-3.5-flash-lite)

✅ **Default for:**
- Simple text conversations
- Q&A about basic concepts
- High-traffic scenarios (50+ RPM)
- Quick responses needed (<1s latency)

**Example requests:**
```javascript
// Guiding Resource context (default)
streamGeminiResponse(chat, "Apa itu diagram pencar?", "guiding_resource")

// Hasil Tes context (default)
streamGeminiResponse(chat, "Gimana hasil tesku?", "hasil_tes")
```

---

### **When to Use FLASH Model** (gemini-3.6-flash)

✅ **Auto-switch when:**
1. **User uploads image/media**
   ```javascript
   streamGeminiResponse(chat, userMessage, context, 0, {
     hasImage: true  // Will use Flash model
   })
   ```

2. **Complex reasoning task**
   ```javascript
   streamGeminiResponse(chat, "Analisis korelasi data ini...", context, 0, {
     isComplexTask: true  // Will use Flash model
   })
   ```

3. **Solution context** (always uses Flash)
   ```javascript
   streamGeminiResponse(chat, userMessage, "solution")
   // Auto-uses Flash due to context complexity
   ```

---

## 🔄 Fallback Strategy

### **Rate Limit Handling**

**Scenario 1: Flash model hits 429 (Rate Limit)**
```
User Request → Flash Model (429 Error) 
           ↓
       Fallback to Lite Model
           ↓
       Success! ✅
```

**Scenario 2: All models exhausted**
```
User Request → Flash (429) → Lite (429) → Retry 3x with backoff
           ↓
       Error message to user
```

### **Exponential Backoff**

| Retry | Delay | Total Wait |
|-------|-------|------------|
| 1st   | 2s    | 2s         |
| 2nd   | 4s    | 6s         |
| 3rd   | 8s    | 14s        |

---

## 💻 Implementation Guide

### **Basic Usage (Auto-Selection)**

```javascript
import { streamGeminiResponse, createGuidingResourceChat } from './lib/geminiService'

const chat = createGuidingResourceChat()

// Simple text - uses Lite model automatically
for await (const chunk of streamGeminiResponse(
  chat, 
  "Apa itu korelasi?", 
  "guiding_resource"
)) {
  console.log(chunk)
}
```

### **With Image Upload**

```javascript
// User uploaded image - automatically uses Flash model
for await (const chunk of streamGeminiResponse(
  chat, 
  "Jelaskan diagram ini", 
  "guiding_resource",
  0,
  { hasImage: true }  // Force Flash model
)) {
  console.log(chunk)
}
```

### **Complex Task**

```javascript
// Complex analysis - use Flash model
for await (const chunk of streamGeminiResponse(
  chat, 
  "Analisis korelasi dan berikan 5 rekomendasi berbasis data", 
  "solution",
  0,
  { isComplexTask: true }  // Force Flash model
)) {
  console.log(chunk)
}
```

### **Manual Model Override**

```javascript
import { MODEL_CONFIG } from './lib/geminiService'

// Force specific model (bypass auto-selection)
for await (const chunk of streamGeminiResponse(
  chat, 
  userMessage, 
  context,
  0,
  { forceModel: MODEL_CONFIG.FLASH }  // Always use Flash
)) {
  console.log(chunk)
}
```

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│           USER REQUEST                          │
└───────────────┬─────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────┐
│    selectGeminiModel(options)                   │
│    ├─ hasImage?                                 │
│    ├─ isComplexTask?                            │
│    ├─ context === 'solution'?                   │
│    └─ forceModel?                               │
└───────────────┬─────────────────────────────────┘
                │
        ┌───────┴───────┐
        ▼               ▼
┌─────────────┐  ┌─────────────┐
│ LITE Model  │  │ FLASH Model │
│ (Default)   │  │ (Complex)   │
└──────┬──────┘  └──────┬──────┘
       │                │
       └────────┬───────┘
                │
                ▼
        ┌───────────────┐
        │  429 Error?   │
        └───────┬───────┘
                │
         ┌──────┴──────┐
         ▼             ▼
    ┌────────┐    ┌─────────────┐
    │ Success│    │  Fallback   │
    └────────┘    │  to Lite    │
                  └──────┬──────┘
                         │
                  ┌──────┴──────┐
                  ▼             ▼
             ┌────────┐    ┌─────────┐
             │ Success│    │ Retry 3x│
             └────────┘    └─────────┘
```

---

## 📊 Performance Metrics

### **Expected Performance**

| Metric | Lite Model | Flash Model |
|--------|------------|-------------|
| **Latency** | <500ms | <1000ms |
| **Token/sec** | 800+ | 500+ |
| **RPM Capacity** | 60+ | 30+ |
| **Token Cost** | Low | Medium |
| **Reasoning Quality** | Good | Excellent |

### **When to Optimize**

⚠️ **Switch to Lite more often if:**
- Getting frequent 429 errors
- Response time >2s average
- Traffic >50 concurrent users

⚠️ **Switch to Flash more often if:**
- User complaints about quality
- Need multimodal support
- Complex reasoning tasks increase

---

## 🔧 Configuration Options

### **Environment Variables**

```bash
# .env.local

# Gemini API Keys (rotation for rate limit management)
VITE_GEMINI_API_KEY=your_key_1
VITE_GEMINI_API_KEY_2=your_key_2
VITE_GEMINI_API_KEY_3=your_key_3
VITE_GEMINI_API_KEY_4=your_key_4

# Force Groq fallback (for debugging)
VITE_FORCE_USE_GROQ=false

# Groq keys (emergency fallback)
VITE_GROQ_API_KEY=your_groq_key
VITE_GROQ_API_KEY_TWO=your_groq_key_2
```

### **Runtime Configuration**

Edit `src/lib/geminiService.js`:

```javascript
// Change default model
const MODEL_CONFIG = {
  LITE: 'gemini-3.5-flash-lite',
  FLASH: 'gemini-3.6-flash',      // Change to gemini-3.8-flash for more power
  FALLBACK: 'gemini-2.5-flash'
}

// Adjust auto-switching logic
function selectGeminiModel(options = {}) {
  // Add custom logic here
  const shouldUseFlash = 
    hasImage ||
    isComplexTask ||
    context === 'solution' ||
    context === 'hasil_tes'  // NEW: Always use Flash for hasil_tes
  
  // ...
}
```

---

## 🧪 Testing

### **Test Auto-Switching**

```javascript
// Test 1: Simple text (should use Lite)
const result1 = await streamGeminiResponse(
  chat, 
  "Hai Milo!", 
  "guiding_resource"
)
// Expected: 🤖 Model: gemini-3.5-flash-lite

// Test 2: Complex task (should use Flash)
const result2 = await streamGeminiResponse(
  chat, 
  "Analisis korelasi", 
  "guiding_resource",
  0,
  { isComplexTask: true }
)
// Expected: 🤖 Model: gemini-3.6-flash

// Test 3: Image upload (should use Flash)
const result3 = await streamGeminiResponse(
  chat, 
  "Jelaskan gambar ini", 
  "guiding_resource",
  0,
  { hasImage: true }
)
// Expected: 🤖 Model: gemini-3.6-flash
```

### **Test Fallback**

Simulate 429 error:
```javascript
// Force Flash model, then simulate rate limit
// Expected: Auto-fallback to Lite model
```

---

## 📈 Monitoring

### **Console Logs**

Look for these logs to track model usage:

```
🔀 Model selection:
   hasImage: false
   isComplexTask: false
   context: guiding_resource
   → Selected: gemini-3.5-flash-lite (Lite)

🤖 Model: gemini-3.5-flash-lite
📡 Calling Gemini API with SDK...
✅ Stream started
```

### **Error Tracking**

Monitor for:
```
🔄 429 Rate Limit on Flash model - Falling back to Lite model...
```

If frequent, consider:
1. Adding more API keys
2. Increase Lite usage ratio
3. Implement request queuing

---

## 🚀 Future Improvements

### **Planned Enhancements**

1. **Dynamic model selection based on history**
   ```javascript
   // If user has multiple complex questions in a row, 
   // stay on Flash model to maintain context quality
   ```

2. **Token-based model selection**
   ```javascript
   // If conversation history >4k tokens, 
   // automatically use Flash for better context window
   ```

3. **User preference learning**
   ```javascript
   // Track user satisfaction signals
   // Adjust model selection per user
   ```

4. **Cost monitoring dashboard**
   ```javascript
   // Real-time tracking of:
   // - Total requests per model
   // - Token usage breakdown
   // - Cost per conversation
   ```

---

## 📝 API Reference

### **streamGeminiResponse()**

```typescript
async function* streamGeminiResponse(
  chat: ChatSession,
  userMessage: string,
  context: 'guiding_resource' | 'solution' | 'hasil_tes',
  retryCount: number = 0,
  options: {
    hasImage?: boolean,
    isComplexTask?: boolean,
    forceModel?: string
  } = {}
): AsyncGenerator<string>
```

**Parameters:**
- `chat` - ChatSession instance
- `userMessage` - User's input text
- `context` - Conversation context (determines system prompt)
- `retryCount` - Internal retry counter (default: 0)
- `options` - Model selection options
  - `hasImage` - User uploaded media (forces Flash)
  - `isComplexTask` - Task requires advanced reasoning (forces Flash)
  - `forceModel` - Manual model override

**Returns:** AsyncGenerator yielding response chunks

---

### **selectGeminiModel()**

```typescript
function selectGeminiModel(options: {
  hasImage?: boolean,
  isComplexTask?: boolean,
  context?: string,
  forceModel?: string
}): string
```

**Parameters:**
- `hasImage` - Multimodal content flag
- `isComplexTask` - Complex reasoning flag
- `context` - Conversation context
- `forceModel` - Manual override

**Returns:** Model ID string (from MODEL_CONFIG)

---

## 🛠️ Troubleshooting

### **Issue: Always using Flash model**

**Check:**
1. Context is 'solution'? → Expected (Solution always uses Flash)
2. Log output shows "isComplexTask: true"? → Check caller
3. Force override set? → Remove `forceModel` parameter

**Fix:**
```javascript
// Ensure no force override
streamGeminiResponse(chat, msg, 'guiding_resource', 0, {
  // forceModel: MODEL_CONFIG.FLASH  ❌ Remove this
})
```

---

### **Issue: Frequent 429 errors**

**Solutions:**
1. **Add more API keys**
   ```bash
   VITE_GEMINI_API_KEY_5=new_key
   VITE_GEMINI_API_KEY_6=new_key
   ```

2. **Increase Lite usage**
   ```javascript
   // Adjust auto-switch logic to use Lite more often
   const shouldUseFlash = 
     hasImage ||  // Only image requires Flash
     // Remove: isComplexTask
     // Remove: context === 'solution'
   ```

3. **Implement request queuing**
   ```javascript
   // Add queue to spread requests over time
   ```

---

### **Issue: Poor response quality**

**Solutions:**
1. **Force Flash model for that context**
   ```javascript
   streamGeminiResponse(chat, msg, context, 0, {
     forceModel: MODEL_CONFIG.FLASH
   })
   ```

2. **Upgrade to gemini-3.8-flash**
   ```javascript
   const MODEL_CONFIG = {
     FLASH: 'gemini-3.8-flash'  // More intelligent
   }
   ```

---

## 📚 Related Documentation

- [Gemini API Docs](https://ai.google.dev/gemini-api/docs)
- [Model Comparison](https://ai.google.dev/gemini-api/docs/models/gemini)
- [Rate Limits](https://ai.google.dev/gemini-api/docs/rate-limits)

---

## 📞 Support

Questions? Contact the development team or check:
- Project README: `README.md`
- Design Doc: `design.md`
- Requirements: `requirements.md`

---

**Last Updated:** 2025-01-XX  
**Version:** 1.0.0  
**Author:** Mentalytics Team
