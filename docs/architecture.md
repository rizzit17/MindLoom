# Visualli Mini Mindmap Architecture

## Overview
Visualli Mini Mindmap is a monorepo built using `pnpm` workspaces containing three main packages:
- `shared`: Contains Mindmap types and Zod schemas shared across frontend and backend.
- `server`: Express + TypeScript backend with SQLite persistence and OpenAI structured outputs (with Mock fallback).
- `client`: React 19 + TypeScript + Vite + Tailwind CSS + React Flow frontend.

## Flow
1. User submits text via `InputPanel`.
2. Controller performs edge-case pre-checks (empty, too short <20 chars, truncation >12000 chars).
3. Service calls LLM client (OpenAI or Mock provider).
4. `mindmapValidator` runs Zod parsing and domain validation (5-9 nodes, unique ids, valid rootId, no dangling edges).
5. If invalid, service attempts exactly one corrective repair prompt retry.
6. Valid mindmaps are stored in SQLite and returned to client.
7. Frontend renders interactive React Flow diagram with custom node cards, summary drawer, and history.
