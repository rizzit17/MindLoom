# Visualli Mini Mindmap 

> A production-quality, full-stack application that transforms raw input text into interactive node-link mindmaps powered by structured LLM outputs, strict Zod + domain-rule validation, automatic repair-retry cycles, and React Flow visualization.

---

##  Time Note & Submission Details

- **Time Spent**: ~4.5 Hours
- **LLM Provider**: **Groq API** (`llama-3.3-70b-versatile`), **Google Gemini API** (`gemini-2.5-flash`), and **OpenAI API** (`gpt-4o-mini`). Configured with native JSON Structured Output mode (`response_format: { type: "json_object" }`).
- **MOCK Mode Support**: Supported via `MOCK_MODE=true` environment flag for running fully offline without requiring an API key.
- **Stretch Goals Completed (2 of 4)**:
  1.  **Light / Dark Theme**: Driven by CSS variables (`:root` / `.dark` design tokens) with custom studio dot grid background texture and theme-aware components.
  2.  **Drill-down Expansion**: Clicking any node surfaces a **"Drill Down & Expand Node"** action button that triggers a `POST /api/mindmaps/:id/expand` endpoint, dynamically expanding child sub-nodes for that node.

---

##  Architecture Overview

Visualli Mini Mindmap treats all LLM outputs as untrusted input. Malformed responses trigger an automated repair flow with itemized error descriptions before persisting or serving data to the client.

```
┌─────────────────┐       POST /api/mindmaps       ┌───────────────────────────┐
│                 │ ─────────────────────────────> │ Express API Controller    │
│  React Client   │                                └─────────────┬─────────────┘
│ (React Flow +   │                                              │
│  React Query)   │ <───────────────────────────── ┌─────────────▼─────────────┐
└─────────────────┘       201 Created Mindmap      │ Mindmap Service           │
                                                   └─────────────┬─────────────┘
                                                                 │
                                                   ┌─────────────▼─────────────┐
                                                   │ LLM Provider Factory      │
                                                   │ (Groq / OpenAI / Mock)    │
                                                   └─────────────┬─────────────┘
                                                                 │
                                                   ┌─────────────▼─────────────┐
                                                   │ Domain Rules & Zod        │
                                                   │ Validation (5-9 nodes,    │
                                                   │ non-dangling connections) │
                                                   └───────────────────────────┘
```

---

##  Features & Verification Checklist

- **Strict Validation Engine**:
  - Validates JSON structure via Zod schema (`shared/src/schemas/mindmap.schema.ts`).
  - Validates domain rules via `mindmapValidator.ts`:
    - Exactly 5 to 9 nodes.
    - Exactly 1 root node with non-empty label.
    - Unique node IDs (`n1`, `n2`, ...).
    - No dangling edge connections (source and target IDs must exist).
    - Single connected component (all nodes reachable from root).
- **Automated Repair-Retry Flow**:
  - If validation fails, `MindmapService` invokes the LLM exactly once more, passing itemized validation error descriptions to prompt self-correction.
- **Drill-Down Expansion API**:
  - `POST /api/mindmaps/:id/expand` appends new sub-nodes dynamically branching off any selected parent node.
- **Budget Truncation (12,000 Chars)**:
  - Input text exceeding 12,000 characters is deterministically truncated pre-LLM call.
  - The API response surfaces `truncated: true` and logs warning metadata.
- **Interactive Node-Link Diagram**:
  - Visualized using React Flow (`@xyflow/react`) and auto-layout calculated via Dagre graph engine.
  - Central root node features distinct vibrant terracotta styling.
  - Interactive click handling opens the summary panel showing exact 1-sentence summaries and node relationship connections.
- **Split Workspace Push Layout**:
  - History sidebar operates as an inline collapsible push-panel, allowing simultaneous viewing of history and workspace without screen overlap.
- **Persistent Storage**:
  - Mindmaps persisted locally in SQLite (`better-sqlite3` with WAL mode enabled).
- **Complete Test Coverage**:
  - Unit tests for validation, truncation, and repair retry orchestration.
  - Integration tests for Express HTTP API routes.
  - Frontend component tests using React Testing Library and Jest DOM.

---

##  Quick Start

### 1. Requirements

- Node.js >= 18.x
- pnpm >= 8.x (`npm i -g pnpm`)

### 2. Installation & Setup

```bash
# Install all monorepo dependencies
pnpm install

# Copy environment template
cp .env.example .env
```

### 3. Running in MOCK_MODE (No API Key Required)

Set `MOCK_MODE=true` in `.env`. The backend will automatically return realistic canned mindmaps for preset topics (Microservices, AI, DevOps) without calling external API endpoints:

```env
MOCK_MODE=true
```

### 4. Running Locally

```bash
# Run server & client concurrently in dev mode
pnpm dev

# Client available at: http://localhost:5173
# Backend API available at: http://localhost:3001
```

---

##  Running Tests

```bash
# Run all 21 tests across the workspace (backend + frontend)
pnpm test

# Run backend server tests only
pnpm --filter server test

# Run frontend client tests only
pnpm --filter client test
```

---

##  Environment Variables

| Variable | Description | Default |
|---|---|---|
| `PORT` | Backend server port | `3001` |
| `NODE_ENV` | Environment mode (`development` / `production` / `test`) | `development` |
| `MOCK_MODE` | Set `true` to use deterministic mock LLM fixtures without API key | `true` |
| `GROQ_API_KEY` | Groq API key for high-speed live LLaMA 3.3 70B inference | `""` |
| `OPENAI_API_KEY` | OpenAI API key for live GPT-4o-mini generation | `""` |
| `DATABASE_PATH` | SQLite storage file location | `./data/mindmaps.db` |
| `VITE_API_URL` | API base URL for Vite frontend client | `http://localhost:3001` |

---

##  API Endpoint Specification

### `POST /api/mindmaps`
Generates, validates, persists, and returns a mindmap.

- **Request Body**:
  ```json
  {
    "text": "Microservices architecture breaks down applications into independent services..."
  }
  ```
- **Responses**:
  - `201 Created`: Returns mindmap object.
  - `400 Bad Request`: Input empty or < 20 characters.
  - `422 Unprocessable Entity`: LLM output failed domain validation after repair attempt (surfaces `details` array of itemized failures).

### `POST /api/mindmaps/:id/expand`
Expands a node into child sub-nodes.

- **Request Body**:
  ```json
  {
    "nodeId": "n2"
  }
  ```
- **Responses**:
  - `200 OK`: Returns updated mindmap with new child nodes and connections.

### `GET /api/mindmaps`
Returns all persisted mindmap summaries.

### `GET /api/mindmaps/:id`
Returns full mindmap by ID.

---

##  License
MIT © Visualli Engineering Submission
