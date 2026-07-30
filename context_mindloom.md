# Context — Visualli Mini Mindmap

## What This Project Is

This is a submission for the **Visualli AI Challenge ("Mini Mindmap")** — an engineering
evaluation exercise. It is a scaled-down version of what Visualli does in production:
turn arbitrary text content into an interactive visual (a mindmap).

The challenge evaluates three things, in priority order:

1. **AI Engineering** (primary focus) — how well untrusted LLM output is constrained,
   validated, and repaired.
2. **Backend Engineering** — a small, clean Express API with validation, persistence,
   and centralized error handling.
3. **Frontend Engineering** — a React UI that renders the mindmap as an actual
   node-link diagram (not a list), with click-to-reveal summaries.

## Origin of This Spec

Two source documents were provided and treated as the source of truth:

- `Visualli_README.md` — the top-level repo overview, listing the AI Challenge and a
  separate Fullstack Challenge (not attempted here), plus submission guidance
  (public repo, milestone commits, clear organization).
- `Visualli_ai-challenge.md` — the actual challenge brief: problem statement, the
  strict `Mindmap` data contract, required backend endpoints, required frontend
  behavior, edge cases, stretch goals, and evaluation criteria.

From these, a single comprehensive implementation prompt was generated for a coding
agent (Antigravity) to build the full project without further clarification. That
prompt is the basis for `architecture.md` and for the actual build.

## Core User Flow

1. User pastes a block of text (article, notes, blog post, etc.) into a textarea and
   clicks "Generate."
2. Backend sends the text to an LLM using **structured output / JSON mode** and
   receives a `Mindmap` object back.
3. Backend **never trusts the LLM output** — it is validated against a Zod schema and
   a set of domain rules (node count, unique ids, valid root, no dangling edges). If
   invalid, the backend retries **exactly once** with a corrective repair prompt
   before giving up and returning a clean error.
4. Frontend renders the returned `Mindmap` as an interactive node-link diagram
   (React Flow), root centered/at top, children arranged around it, edges labeled.
5. Clicking a node reveals its one-sentence `summary` in a side panel.

## The Data Contract (must never drift)

```ts
type MindmapNode = {
  id: string;      // stable and unique within the mindmap
  label: string;   // 1-4 words
  summary: string; // one sentence
};

type MindmapConnection = {
  from: string;  // node id
  to: string;    // node id
  label: string; // relationship label, e.g. "causes" or "part of"
};

type Mindmap = {
  title: string;
  rootId: string;             // must match one node's id
  nodes: MindmapNode[];       // 5-9 nodes total, including the root
  connections: MindmapConnection[];
};
```

This type lives once, in `shared/`, and both `client` and `server` import it — never
duplicated.

## Hard Validation Rules (the backstop against unreliable LLMs)

- 5–9 nodes total, including the root.
- `rootId` must match a real node id.
- Every `connections[].from` / `.to` must reference a real node id — no dangling edges.
- Node ids must be unique.
- On parse/validation failure: retry **once** with a corrective prompt. If still
  invalid, throw a meaningful, typed error — never leak a raw stack trace to the
  client.

## Required Edge Cases

- Empty input → reject before calling the LLM (`400`).
- Input too short to summarize meaningfully → reject (`400`).
- Input long enough to raise token-limit concerns → truncate deterministically
  before sending to the LLM.
- `MOCK_MODE=true` → bypass the real LLM entirely, return a canned but realistic
  `Mindmap` from fixtures, documented in the README, so reviewers can run the app
  without an API key.

## Required Backend Endpoints

- `POST /api/mindmaps` — `{ text: string }` → generates, persists, returns the created
  `Mindmap` with an id.
- `GET /api/mindmaps` — list of `{ id, title, createdAt }`.
- `GET /api/mindmaps/:id` — one full stored `Mindmap`.

## Required Frontend Behavior

- Textarea + submit button, with a visible loading state during generation.
- Diagram view rendering the actual node-link structure (SVG/canvas/divs/React Flow
  all acceptable — this project chose React Flow).
- Clicking a node shows its summary (panel/tooltip/modal all acceptable — this
  project chose a side panel).
- Visible empty and error states — errors must never be console-only.

## Testing Expectations

- Backend (Jest): request validation failure, a successful create flow, and the
  generator's schema-repair/retry logic — LLM calls always mocked, never real.
- Frontend: at least one test (React Testing Library) covering node click →
  summary reveal, or layout logic.

## Stretch Goals (optional, not required for core credit)

Pick at most one or two if time remains: streaming generation (SSE), drill-down
expansion per node, two-phase generation (outline pass + fill-in pass), light/dark
theme via CSS variables. Depth on one beats breadth across several. This project
included dark mode as a "nice touch" even though optional.

## Evaluation Criteria (what the reviewer is actually scoring)

| Area | What's being judged |
|---|---|
| Correctness | Working end-to-end flow, edge cases (bad input, malformed LLM output, missing node references) handled gracefully |
| Judgment around untrusted LLM output | Real validation/repair logic, not blind trust in the model |
| Code organization | A structure another engineer could navigate without explanation |
| Testing quality | Tests that cover real failure modes, not just happy path |
| Communication | A README explaining setup, tradeoffs, and what's rough due to time |

## Submission Requirements

- Public repository URL.
- Commits at logical milestones — the evolution must be visible, not one giant
  final commit.
- `README.md` with setup steps, which LLM provider was used, how to run in
  `MOCK_MODE` without an API key, and an honest note on time spent and rough edges.

## Time Budget

Roughly 4–6 hours for the core requirements. A clean, fully-tested core submission
beats a rushed one with stretch goals bolted on.

## Related File

See `architecture.md` for how this context was translated into an actual technical
design (stack, folder structure, layering, commit plan).
