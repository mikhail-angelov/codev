# PRODUCT REQUIREMENTS DOCUMENT

# Codev — MVP PRD

| Field | Value |
|---|---|
| Version | 1.0 MVP |
| Date | March 24, 2026 |
| Author | Mikhail Angelov |
| Status | Ready for implementation |
| Stack | React · Node.js · TypeScript · DeepSeek API |
| Target launch | MVP in 6–8 weeks |

## 1. Product overview

Codev is a web app that helps software engineers prepare for technical interviews through timed coding challenges and AI-powered review.

The MVP is intentionally narrow. It is not trying to compete with LeetCode on breadth, and it is not yet a full interview platform. Its purpose is to validate one core promise:

> A practicing engineer can submit a coding solution and immediately receive credible, conversational interview-style feedback.

The differentiator is the AI interviewer experience:
- review of correctness
- Big-O time and space analysis
- targeted improvement suggestions
- follow-up questioning
- contextual hints
- free-form discussion tied to the current problem and current code

## 2. Problem statement

Engineers preparing for technical interviews face three recurring problems:

1. Pass/fail feedback is too shallow. A green check does not explain whether the approach is strong, interview-ready, or easy to defend.
2. Guidance is not conversational. Static hints do not answer questions like “am I close?” or “what edge case am I missing?”
3. Practice lacks calibration. Many engineers do not know whether their solution quality, complexity reasoning, and communication are actually improving.

Codev MVP addresses these with a focused loop:

**select problem → write code → run sample tests → submit → receive AI review → ask follow-up questions or request hints**

## 3. Target users

### Primary users
- Mid-level to senior software engineers (roughly 3–10 YOE)
- Actively interviewing or preparing to interview
- Comfortable paying for tools that improve interview performance
- Prefer immediate, private practice over scheduled peer sessions

### Secondary users
- Engineers maintaining interview readiness
- Late-stage CS students
- Bootcamp graduates transitioning into software roles

## 4. Product goal

Deliver the fastest way for a practicing engineer to get credible, conversational interview feedback on a coding solution.

## 5. Success metrics

### MVP success metrics
- 10–20 people complete at least one full review flow
- At least 5 users return for a second practice session
- At least 30% of initial users complete more than 3 reviewed submissions
- Median session length of at least 15 minutes
- Positive usefulness signal on AI feedback from early users

### Quality signals to track during MVP
- Review usefulness: thumbs up/down or simple 1–5 rating
- Hint usefulness: whether the user continues solving after hint usage
- Review latency and error rate
- % of sessions reaching submit-and-review successfully

## 6. Scope

## 6.1 In scope for MVP

### Problem library
- 15 curated problems maximum
- Coverage across Arrays, Strings, Trees, Graphs, Linked Lists, Recursion, and basic Dynamic Programming
- Difficulty tiers: Easy / Medium / Hard
- Per problem:
  - title
  - description
  - examples
  - constraints
  - starter template
  - hint progression
  - reference solution
  - sample test metadata

### Editor and solve flow
- Browser-based JavaScript editor using CodeMirror 6
- Starter code per problem
- Reset action
- Run sample tests action
- Submit for AI review action
- Elapsed timer

### AI interviewer
- Review current solution for:
  - correctness
  - time complexity
  - space complexity
  - 1–2 concrete improvements
  - one follow-up interview-style question
- Provide contextual hints in several modes:
  - approach
  - complexity
  - edge cases
  - explain current code
- Support free-form chat tied to:
  - selected problem
  - current code
  - recent AI thread

### Session behavior
- Local-only client session state
- Per-problem working state during the current session
- No account system in MVP
- No persistent history in MVP

### Deployment
- Ubuntu VPS deployment
- Docker / Docker Compose
- Reverse proxy handled outside the app stack

## 6.2 Explicitly out of scope for MVP
- User accounts and authentication
- Persistent submission history
- Billing and subscription enforcement
- Usage metering by user account
- Weak-topic detection across sessions
- Mock interview mode
- Bookmarking and notes
- Company-tagged problem sets
- Admin dashboards
- Referral system
- Streaks
- XP system
- Progress bars by difficulty
- Mobile-first optimization
- Large problem library expansion

## 7. UX principles

- Three-column layout: problem navigation, coding workspace, AI panel
- AI panel is always visible because feedback is the product’s core value
- Keep the code editor minimal and distraction-light
- AI responses should feel conversational, but remain structured and scannable
- Avoid gamification in MVP; prioritize usefulness over engagement mechanics

## 8. Technical architecture

## 8.1 Frontend
- React + TypeScript + Vite
- Zustand for local state
- CodeMirror 6 for the JavaScript editor
- Custom design tokens via CSS variables
- Desktop-first responsive layout

## 8.2 Backend
- Node.js + Express + TypeScript
- REST endpoints for problems, review, hints, and chat
- DeepSeek API used server-side only
- Basic per-session or per-IP rate limiting for AI endpoints
- Structured logs for request tracing and failure diagnosis

## 8.3 Execution model
- MVP supports running visible sample tests only
- Keep execution model intentionally constrained
- Do not build a full remote judge in MVP
- If iframe-based execution is used, treat it as a limited implementation detail with strict boundaries

## 8.4 Prompt strategy
- Prompt modules live in application code, versioned with the backend
- Do not use dynamically editable JSON prompt files in MVP
- Prompt modes:
  - review
  - hints
  - code explanation
  - follow-up chat

## 8.5 Data model
- Problems are seeded from validated static data files
- No database required for MVP if local/session-only behavior remains sufficient
- If lightweight persistence becomes necessary during build, prefer a minimal and explicit addition rather than expanding scope

## 8.6 Infrastructure
- All services run in Docker
- Docker Compose used for local development and VPS deployment
- App ports must be configurable
- Production HTTPS termination handled by existing external reverse proxy/service

## 9. Monetization stance for MVP

Monetization is not part of the MVP implementation.

The MVP may be shown publicly and may be used for early validation conversations, but billing, subscription gating, and plan enforcement are deferred to Phase 2 or later.

## 10. Risks and mitigations

| Risk | Likelihood | Mitigation |
|---|---:|---|
| AI review quality is inconsistent or untrustworthy | Medium | Keep prompt outputs structured, manually review early outputs, add easy feedback signals, iterate on prompt rubric |
| Content quality is too weak to support the product promise | Medium | Start with a small curated set of high-quality problems rather than a large library |
| Scope creep turns MVP into a platform build | High | Freeze MVP around one core loop and move all growth features to Phase 2 |
| AI latency makes the experience feel broken | Medium | Add timeouts, loading states, and structured error handling; measure review latency early |
| Lightweight test execution is fragile | Medium | Keep run-tests scope small and clearly limited to visible sample tests |

## 11. MVP feature checklist

A launchable MVP must support all of the following:
- Browse available problems
- Select one problem
- Read description, examples, and constraints
- Edit JavaScript starter code
- Run sample tests
- Submit solution for AI review
- Receive structured review result
- Request multiple hint types
- Ask free-form follow-up questions
- Recover gracefully from API failures

## 12. Implementation priorities

### P0 — launch blockers
- frontend and backend foundations
- problem seed schema and first problem set
- problem browsing and detail pages
- JavaScript editor
- run-tests flow
- AI review endpoint and UI
- hint endpoint and UI
- chat endpoint and UI
- logs, validation, and error handling
- Dockerized deployment

### P1 — MVP required but can follow immediately after P0
- improved review presentation
- topic filter
- better empty/loading/error states
- smoke and integration tests
- minimal landing page

### P2 — deferred
Everything listed in the Phase 2 PRD.

## 13. Build sequence

Recommended build order:
1. app foundation
2. backend problem APIs
3. frontend shell and problem browsing
4. editor and sample tests
5. AI review flow
6. hints and free-form chat
7. reliability, polish, deployment

## 14. Launch decision

The MVP is ready to launch when the core loop is stable, useful, and understandable:

**select problem → code → run sample tests → submit → get review → continue via hints/chat**

If that loop works well, Codev has enough signal to justify Phase 2.
