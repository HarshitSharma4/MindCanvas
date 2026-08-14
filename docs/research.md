# MindCanvas — Phase 1 Research & Architecture Insights

## 1. Executive Summary

This document captures technical research and decisions for building **MindCanvas**, a production-quality Personal Life OS. MindCanvas unifies daily journaling, personal finances, project management, tasks, Google Calendar events, learning progress, wellness tracking, daily motivation, media management, and privacy-first AI capabilities into a single coherent system.

---

## 2. Frontend Technology Stack Research

### Next.js & App Router Architecture
- **Framework:** Next.js (App Router, TypeScript).
- **Rendering Strategy:** Server Components for initial shell and static/SSR sections; Client Components (`'use client'`) for interactive components (Canvas Journal, interactive charts, Command Palette, modal dialogs).
- **Data Fetching:** TanStack Query (React Query v5) for client-side state caching, debounced search requests, optimistic updates, and background invalidation.
- **Styling & UI:** Tailwind CSS with CSS Variables for theme tokens (Dark & Light modes), Lucide icons, Framer Motion for micro-interactions, and accessible UI component primitives.
- **Forms & Validation:** React Hook Form integrated with Zod schemas for client-side validation.
- **Data Visualization:** Recharts for financial breakdowns, study habits, and wellness stats.

---

## 3. Backend Technology Stack Research

### FastAPI & Python Async Standards (2025/2026)
- **Framework:** FastAPI with Python 3.11/3.12 `asyncio`.
- **Validation & Schemas:** Pydantic v2 (`model_validate`, `Annotated` types, custom field validators).
- **Layered Modular Architecture:**
  - `routers/`: API path handlers with HTTP verb mapping and OpenAPI tags.
  - `services/`: Business logic, validation, transaction boundaries, AI orchestration.
  - `domain/`: Pydantic schemas, enums, data contracts.
  - `repositories/`: Database abstraction queries.
  - `integrations/`: Third-party clients (Google Calendar OAuth, Supabase client, AI Providers).
- **Dependency Injection:** FastAPI `Depends` pattern for injecting Auth context, DB pools, and configurable AI engines.
- **Configuration:** `pydantic-settings` reading `.env` securely.

---

## 4. Database, Auth & Storage Research

### Supabase & PostgreSQL
- **PostgreSQL Database:** Relational schema with foreign key constraints, explicit indexing on `user_id` and date/status fields.
- **Row Level Security (RLS):** Crucial multi-tenant security mechanism. Every table incorporates `user_id UUID` referencing `auth.users(id)` and policies enforcing `auth.uid() = user_id`.
- **Supabase Auth:** Support for Email/Password authentication and Google OAuth 2.0. Server-side token verification via JWT.
- **Supabase Storage:** Storage buckets `journal-media` with object-level security policies (`user_id/*`).
- **Vector Extensions:** PostgreSQL `pgvector` enabled for future document & journal embedding storage.

---

## 5. Google Calendar Integration Research

### OAuth 2.0 & API Specs
- **OAuth Scopes:** Minimum necessary scopes (`https://www.googleapis.com/auth/calendar.events`).
- **Security:** OAuth 2.0 PKCE flow. Access and refresh tokens stored encrypted (AES-256-GCM) in the backend `calendar_accounts` table.
- **Capabilities:** Fetch events, create events (e.g. meetings, reminders), update/delete events, link calendar IDs to MindCanvas projects/tasks.

---

## 6. AI Architecture & Safety Research

### Pluggable Provider Abstraction
- **Abstract Class:** `AIProvider` defining standard methods (`generate_completion`, `extract_structured_data`, `generate_embeddings`).
- **Implementations:** `OpenAIProvider` (using `gpt-4o` / `gpt-4o-mini`) and `GeminiProvider` (using `gemini-1.5-flash` / `gemini-1.5-pro`).
- **Fallback Engine:** Smart local rules engine when external AI keys are omitted, ensuring full offline/demo capabilities.

### Safety & Confirmation Rule
- **No Unsafe Direct Mutations:** AI extraction parses journal entries or text input into structured JSON action proposals (e.g., `create_task`, `create_financial_transaction`, `create_calendar_event`).
- **Human Confirmation Gate:** The backend returns an `action_proposal` with `requires_confirmation: true`. The frontend renders a confirmation preview dialog to the user. Database mutation ONLY occurs upon explicit user button click.

---

## 7. Key Tradeoffs & Architectural Summary

| Dimension | Decision | Tradeoff / Rationale |
|---|---|---|
| Architecture | Modular Monolith | Simplifies deployment and state management over premature microservices. |
| AI Integration | Abstracted Service Layer | Prevents vendor lock-in; allows switching between OpenAI, Gemini, or local models. |
| Multi-Tenancy | Supabase RLS | Enforces data isolation at the database engine level, preventing authorization leaks. |
| User Mutation | Human-in-the-Loop Confirmation | Prevents AI hallucinated writes into financial, task, or calendar data. |
