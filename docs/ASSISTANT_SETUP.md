# How to Set Up the AI Assistant

## Overview

The assistant is the floating orb (bottom-right). Right now it only shows “Coming soon.” To make it work you need:

1. **Backend:** Assistant API routes + controller (and optionally a real AI service).
2. **Frontend:** Panel that opens from the orb + UI that calls the backend.

---

## 1. Backend Setup

### 1.1 Create files

| File | Purpose |
|------|--------|
| `backend/routes/assistant.routes.js` | Define routes and mount controller |
| `backend/controllers/assistant.js` | Handle requests, validate body, call AI service, return JSON |
| `backend/services/ai.service.js` | (Optional) Call LLM API; can start with stub responses |

### 1.2 Endpoints to implement

| Method | Endpoint | Request body | Response |
|--------|----------|--------------|----------|
| POST | `/api/assistant/chat` | `{ message, context?: { studentId?, iepId? } }` | `{ reply: string }` |
| POST | `/api/assistant/present-levels` | `{ studentId, assessmentIds?, observationIds? }` | `{ draft: string, draftGenerated: true }` |
| POST | `/api/assistant/goals/generate` | `{ iepId?, areaOfNeed, baseline, targetDate? }` | `{ suggestions: [...] }` |
| POST | `/api/assistant/goals/analyze` | `{ goalStatement }` | `{ score, feedback, suggestions[] }` |
| POST | `/api/assistant/accommodations/suggest` | `{ studentId?, needs[], gradeLevel? }` | `{ suggestions: [...] }` |

### 1.3 Mount in `service.js`

```js
import assistantRoutes from './routes/assistant.routes.js'
// ...
app.use('/api/assistant', assistantRoutes)
```

### 1.4 Auth

- Protect all `/api/assistant/*` routes with your existing JWT middleware (same as other API routes).
- Read `req.user` from the token to know who is calling.

### 1.5 Stub vs real AI

- **Stub:** In `controllers/assistant.js` or `services/ai.service.js`, return fixed JSON (e.g. `{ reply: 'Thanks! This is a stub.' }` for chat). No LLM needed.
- **Real AI:** In `services/ai.service.js` call an LLM API (OpenAI, Claude, etc.), build prompts from request body and DB data, then return the parsed result. Use env vars for API keys.

---

## 2. Frontend Setup

### 2.1 Create files

| File | Purpose |
|------|--------|
| `frontend/src/services/assistant.service.js` | Functions that call `POST /api/assistant/chat`, etc. (using existing apiClient) |
| `frontend/src/components/assistant/AssistantPanel.jsx` | Panel/drawer content: tabs or sections (Chat, Present levels, Goals, Accommodations) |
| `frontend/src/components/assistant/AssistantChat.jsx` | Chat UI: message list + input; calls `sendChatMessage()` |
| (Optional) | `PresentLevelsGenerator.jsx`, `GoalGenerator.jsx`, `GoalAnalyzer.jsx`, `AccommodationSuggestions.jsx` | One per feature; call the matching assistant service function |

### 2.2 Update AssistantOrb

- Add state: `isPanelOpen` (boolean).
- On orb click: toggle `isPanelOpen`.
- When `isPanelOpen`, render `<AssistantPanel onClose={() => setPanelOpen(false)} />` (e.g. as a sliding panel or modal next to the orb).

### 2.3 Assistant service (example)

```js
// assistant.service.js
import api from './apiClient.js'

const BASE = '/api/assistant'

export function sendChatMessage(message, context = {}) {
  return api.post(`${BASE}/chat`, { message, context })
}

export function generatePresentLevels(payload) {
  return api.post(`${BASE}/present-levels`, payload)
}
// ... same for goals/generate, goals/analyze, accommodations/suggest
```

### 2.4 UI rules

- Show a short disclaimer: “AI draft — requires educator review.”
- Do not auto-save to IEP; only “Insert” or “Add to IEP” after the user reviews.
- Handle loading and errors (e.g. “Sending…”, “Something went wrong”).

### 2.5 Styles

- Add classes in `App.css` for the panel (e.g. `.assistant-panel`, `.assistant-chat`) so the panel looks consistent with the rest of the app.

---

## 3. Order of work (recommended)

1. **Backend stub**
   - Add `assistant.routes.js` and `controllers/assistant.js`.
   - Implement only `POST /api/assistant/chat` with a stub response.
   - Mount in `service.js` and protect with auth.
   - Test with:  
     `curl -X POST http://localhost:5001/api/assistant/chat -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_JWT" -d '{"message":"hi"}'`

2. **Frontend panel + chat**
   - Add `assistant.service.js` with `sendChatMessage()`.
   - Add `AssistantPanel.jsx` with a simple “Chat” section and `AssistantChat.jsx` (input + send, display reply).
   - Update `AssistantOrb.jsx` to open/close the panel and render the panel when open.
   - Add basic CSS for the panel.

3. **Then**
   - Add more backend endpoints (present-levels, goals, accommodations) as stubs or with real AI.
   - Add the matching frontend components and wire them to the assistant service.

---

## 4. Checklist

- [ ] Backend: `routes/assistant.routes.js` created and mounted in `service.js`
- [ ] Backend: `controllers/assistant.js` with at least `chat` (stub or real)
- [ ] Backend: All `/api/assistant/*` routes require JWT
- [ ] Frontend: `services/assistant.service.js` with `sendChatMessage` (and others as you add endpoints)
- [ ] Frontend: `AssistantPanel.jsx` and `AssistantChat.jsx` created
- [ ] Frontend: `AssistantOrb.jsx` toggles panel open/closed and renders panel
- [ ] Frontend: Panel shows “AI draft — requires educator review” and does not auto-save to IEP
- [ ] Styles: `.assistant-panel` (and related) in `App.css`
