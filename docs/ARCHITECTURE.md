# Codev — Architecture

> System design, data models, and key technical decisions.

---

## System overview

```
┌─────────────────────────────────────────────────────────────────┐
│                          Browser                                 │
│                                                                  │
│   ┌──────────────┐   ┌──────────────────┐   ┌───────────────┐  │
│   │  Topic       │   │  Problem +        │   │  AI Panel     │  │
│   │  Sidebar     │   │  Code Editor      │   │  (chat +      │  │
│   │              │   │                   │   │   review)     │  │
│   └──────────────┘   └──────────────────┘   └───────────────┘  │
│                                                                  │
│              React 19 + Vite + TypeScript                        │
│              CodeMirror 6 (editor)                               │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS / REST
┌────────────────────────▼────────────────────────────────────────┐
│                     Express API Server                           │
│                     Node.js + TypeScript                         │
│                                                                  │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│   │ /problems    │  │ /review      │  │ /hint  /chat         │ │
│   │ /problems/:id│  │ (AI review)  │  │ (AI modes)           │ │
│   └──────────────┘  └──────┬───────┘  └──────────┬───────────┘ │
│                             │                      │             │
│              Rate limiter · Error handler          │             │
└─────────────────────────────┼──────────────────────┼────────────┘
                              │                      │
              ┌───────────────▼──────────────────────▼───────────┐
              │              Deepseek API                        │
              │         claude-sonnet-4-20250514                  │
              └───────────────────────────────────────────────────┘

Phase 2+:
              ┌──────────────────┐   ┌───────────────────────────┐
              │   TypeORM        │   │   Clerk                   │
              │   (sqlite)       │   │   (Auth)                  │
              └──────────────────┘   └───────────────────────────┘
```

---

## Frontend architecture

### Component tree

```
App
├── NavBar
│   ├── Logo
│   ├── TrackIndicator
│   ├── XPBar
│   └── StreakBadge
│
└── Layout (3-column grid)
    ├── Sidebar
    │   ├── TopicList
    │   │   └── TopicItem[]
    │   └── ProgressSection
    │
    ├── Main
    │   ├── SelectView          ← shown when no problem active
    │   │   └── ProblemGrid
    │   │       └── ProblemCard[]
    │   │
    │   └── ProblemView         ← shown when problem loaded
    │       ├── ProblemHeader
    │       │   ├── DiffBadge
    │       │   ├── TopicTag
    │       │   └── Timer
    │       ├── ProblemTabs
    │       │   ├── DescriptionTab
    │       │   ├── HintsTab
    │       │   └── SolutionTab
    │       └── EditorSection
    │           ├── EditorToolbar
    │           └── CodeMirrorEditor
    │
    └── AIPanel
        ├── AIHeader
        │   ├── AITitle
        │   ├── AIStatus
        │   └── HintButtons
        ├── MessageList
        │   └── Message[]       ← ai / user / system / review
        └── ChatInput
```

### State management

MVP uses Zustand state.

```typescript
// useProblem.ts
interface ProblemState {
  current: Problem | null
  code: string
  tab: 'desc' | 'hints' | 'solution'
  timeLeft: number
  xp: number
  streak: number
}

// useAI.ts
interface AIState {
  messages: Message[]
  loading: boolean
  error: string | null
}
```

### API client

```typescript
// lib/api.ts
const API_BASE = import.meta.env.VITE_API_URL ?? '/'

export async function reviewCode(req: ReviewRequest): Promise<ReviewResponse>
export async function getHint(req: HintRequest): Promise<HintResponse>
export async function chat(req: ChatRequest): Promise<ChatResponse>
export async function getProblems(filter?: ProblemFilter): Promise<Problem[]>
export async function getProblem(id: number): Promise<Problem>
```

---

## Backend architecture

### Route structure

```
server/
├── index.ts              # Express app, middleware setup
├── routes/
│   ├── problems.ts       # Problem CRUD
│   ├── review.ts         # AI review endpoint
│   ├── hint.ts           # Hint endpoints
│   └── chat.ts           # Chat endpoint
├── middleware/
│   ├── rateLimit.ts      # Per-IP / per-session limits
│   ├── errorHandler.ts   # Structured error responses
│   └── validate.ts       # Request body validation (zod)
└── lib/
    ├── ai.ts             # Deepseek SDK wrapper
    ├── auth.ts           # auth related code
    └── problems.ts       # Problem data loader
data/
    ├──problems.json     # Seed data — 50 problems
    ├──prod.db           # sqlite db
    └── prompts.ts       # Prompts for AI
```


### Rate limiting

```typescript
// middleware/rateLimit.ts
// MVP: in-memory with express-rate-limit
// Phase 2: Redis-backed with sliding window

const reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,   // 1 hour
  max: 20,                     // Free tier: 20 AI calls/hour
  keyGenerator: (req) => req.ip,
  message: { error: 'Rate limit reached. Upgrade to Pro for unlimited reviews.' }
})
```

---

## Data models

### Problem

```typescript
interface Problem {
  id: number
  title: string
  difficulty: 'easy' | 'medium' | 'hard'
  topic: Topic
  timeLimit: number              // minutes
  description: string            // HTML allowed
  examples: Example[]
  constraints: string[]
  hints: string[]                // ordered, progressively more specific
  starter: Record<Language, string>  // code template per language
  solution: Record<Language, string> // reference solution per language
  tags?: string[]                // e.g. ['google', 'meta', 'two-pointers']
  companies?: string[]
}

interface Example {
  input: string
  output: string
  note?: string
}

type Topic = 'Arrays' | 'Strings' | 'Trees' | 'Graphs' | 'Dynamic Programming'
           | 'Linked Lists' | 'Recursion' | 'Sorting' | 'Binary Search' | 'Heap'

type Language = 'javascript' | 'python' | 'typescript'
```

### Review request / response

```typescript
interface ReviewRequest {
  problemId: number
  code: string
  language: Language
  elapsedSeconds: number
}

interface ReviewResponse {
  correctness: string
  timeComplexity: string
  spaceComplexity: string
  improvements: string[]
  followUp: string
}
```

### Message (AI chat)

```typescript
interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  type: 'chat' | 'hint' | 'review' | 'system'
  timestamp: number
}
```

### User (Phase 2)

```typescript
interface User {
  id: string                     // Clerk user ID
  email: string
  createdAt: Date
  plan: 'free' | 'pro' | 'lifetime'
  streakDays: number
  totalXP: number
  solvedProblems: number[]       // problem IDs
  weakTopics: Topic[]            // computed from submissions
}

interface Submission {
  id: string
  userId: string
  problemId: number
  code: string
  language: Language
  elapsedSeconds: number
  review: ReviewResponse
  score: number                  // 1–10, computed from review
  createdAt: Date
}
```

---

## Key technical decisions

### Why CodeMirror 6 over Monaco?

Monaco (VS Code's editor) is ~3MB gzipped and has heavy startup cost. CodeMirror 6 is ~500KB, tree-shaken, and has a cleaner extension API. For our use case (single-language sessions, no intellisense needed) CodeMirror wins on every axis.

### Why proxy the Deepseek API rather than calling it client-side?

- API key security — never expose keys in the browser
- Rate limiting — enforce per-user limits server-side
- Prompt control — users cannot inspect or override system prompts
- Cost monitoring — centralised logging of token usage


### Why Sqlite over  Postgres?

Sqlite only one file, eazy to migrate, backup, replace, not many users requests, should handle it, typeORM let's easy to switch to postgres latter.

### Why Clerk over Auth.js / custom auth?

Clerk handles email verification, social login, MFA, and session management out of the box. Auth.js requires more configuration for the same result. At MVP stage, developer time is the constraint — Clerk pays for itself immediately.

---

## Performance targets

| Metric | Target | Measurement |
|---|---|---|
| AI review response | < 3s p95 | Server-side timer, logged per request |
| Page load (LCP) | < 1.5s | Vercel Analytics |
| Editor first keystroke | < 100ms | Chrome DevTools |
| Problem load | < 200ms | Network panel |

---

## Security considerations

- API key stored in Railway environment variable, never in version control
- Rate limiting on all AI endpoints (IP + session)
- Request body validation with `zod` on all POST routes
- CORS restricted to production frontend domain
- CSP headers set on all responses (Phase 2)
- No user code is executed server-side (evaluation is simulated in MVP)

---

*Codev · Architecture v0.1 · Internal*
