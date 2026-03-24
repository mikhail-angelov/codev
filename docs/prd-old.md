**PRODUCT REQUIREMENTS DOCUMENT**

**Codev** _- Technical Interview Prep SaaS_

| **Version**       | 0.2 · Draft                                  |
| ----------------- | -------------------------------------------- |
| **Date**          | March 2026                                   |
| **Author**        | MIkhail Angelov                              |
| **Status**        | In review                                    |
| **Stack**         | React · Node.js · TypeScript · Deepseek API  |
| **Target launch** | MVP in 8 weeks                               |

# **1\. Product overview**

Codev is a web SaaS that helps software engineers prepare for technical interviews through timed coding challenges, AI-powered solution review, and structured feedback. Unlike LeetCode or HackerRank, Codev's differentiator is a real-time AI interviewer that behaves like a senior engineer - not a pass/fail test runner.

The AI provides Big-O analysis, correctness assessment, alternative approaches, and probing follow-up questions on every submission. Users can also ask free-form questions mid-problem, request hints at multiple levels of abstraction, and get their code explained line by line.

**Vision**

Become the go-to interview prep platform for mid-level and senior engineers who want mentorship-quality feedback, not just automated test cases.

**Positioning**

| **Platform** | **Strength**                          | **Gap Codev fills**                      |
| ------------ | ------------------------------------- | ---------------------------------------- |
| LeetCode     | Large problem library, community      | No AI feedback, no coaching              |
| Pramp        | Peer mock interviews                  | Scheduling friction, peer quality varies |
| **Codev**    | AI interviewer, instant deep feedback | Available 24/7, no scheduling needed     |

# **2\. Problem statement**

Engineers preparing for technical interviews face three compounding problems:

- Feedback lag. They write code on LeetCode, get a pass/fail result, and have no idea why their approach was suboptimal or what a senior engineer would say about it.
- No conversational guidance. Hints are static. There is no way to ask "am I on the right track?" or "what pattern should I be thinking about?" mid-problem.
- Practice without calibration. Without knowing their actual Big-O, edge case handling, and code clarity, engineers cannot target their weak areas.

Codev solves all three by replacing the pass/fail oracle with a conversational AI interviewer that reviews code the way a thoughtful senior engineer would in a real interview setting.

# **3\. Target users**

**Primary: active job seekers**

- Mid-level to senior engineers (3-10 YOE) actively interviewing at FAANG or growth-stage companies
- Willing to pay \$5-\$10/month for tools that improve interview performance
- High intent: practicing 5+ hours per week

**Secondary: ongoing skill maintainers**

- Engineers not actively interviewing but maintaining sharpness
- Students in their final year of a CS degree
- Bootcamp graduates making the transition to industry roles

# **4\. Goals & success metrics**

Deliver the fastest way for a practicing engineer to get credible, conversational interview feedback on a coding solution.

| **Goal**                      | **MVP target (8 wks)** | **6-month target** |
| ----------------------------- | ---------------------- | ------------------ |
| Registered users              | 5.                     | 500                |
| Paying subscribers            | 1 (\$5 MRR)            | 10  (\$100 MRR)    |
| D7 retention                  | 30%                    | 45%                |
| Problems solved / user / week | 5                      | 12                 |
| NPS                           | -                      | 50+                |
| Avg. session length           | 18 min                 | 25 min             |

# **5\. Feature scope**

## **5.1 MVP features**

**Problem library**

- 15+ curated coding problems across Arrays, Strings, Trees, Graphs, DP, Linked Lists, Recursion
- Difficulty tiers: Easy / Medium / Hard
- Per-problem: description, examples, constraints, hint progression, reference solution
- Topic filter sidebar

**Code editor**

- Browser-based editor with syntax highlighting (JavaScript) CodeMirror
- Starter templates per problem
- Reset and run-tests actions
- Character count and elapsed timer

**AI interviewer**

- Powered by Deepseek API
- Submit & Review: correctness check, Big-O time and space, 1-2 improvements, follow-up question
- Contextual hints: approach nudge, complexity target, edge case list, code explanation
- Free-chat: ask anything, AI responds with awareness of current code and problem

**Session management**

- Countdown timer per problem with warning at 3 minutes
- XP system: earn points per submission
- Streak tracking: consecutive daily practice days
- Per-difficulty progress bars (Easy / Medium / Hard)

## **5.2 Post-MVP features**

**Phase 2 (months 2-3)**

- User accounts, auth, and persistent history
- Problem bookmarking and personal notes
- Interview simulation mode: 60-minute timed mock with 2 problems and a full debrief
- Weak topic detection: AI identifies patterns across submissions

**Phase 3 (months 4-6) not implement**

- Spaced repetition: resurface problems user has struggled with
- Company-specific problem sets (Google, Meta, Amazon, etc.)
- Subscription billing via Stripe: Free tier (5 AI reviews/day) and Pro (\$10/mo, unlimited)
- Referral and share system for LinkedIn post integration
- Admin dashboard: usage analytics, problem performance, churn signals

# **6\. UX & design principles**

- Three-column layout: topic sidebar / problem + editor / AI chat panel - all visible simultaneously
- Editorial aesthetic: warm off-white surfaces, Fraunces serif headings, DM Mono for code
- AI panel always visible - never modal or buried - to reinforce that feedback is central
- Timer and XP in the navbar provide ambient progress cues without demanding attention
- Code editor is minimal: no heavy IDE chrome, just the code and submit button
- AI messages are styled as a conversation, not a report - shorter, conversational, warm

# **7\. Technical architecture**

**Frontend**

- React (Vite) with TypeScript (progressive render, to display first page fast)
- Sate management - Zustand
- CodeMirror 6 for the code editor (syntax highlighting, tab handling, line numbers)
- No UI framework dependency - custom design system using CSS variables
- IFame for code execution - to show console.log output for debug, or see error
- IFame for code evaluation, (hidden for user) run tests, collect output for AI investigation

**Backend**

- Node.js + Express API server
- Deepseek API for all AI features - reviewed code, hints, chat
- API key kept server-side; client never sees it
- Rate limiting per session: 20 AI requests/hour on Free tier
- All AI requests, should be streamed to UI using SSE
- AI prompts should be in separate json file, mapped to app fs - and could be changed, updated dynamically
- User questions/answers should be in separate json file, mapped to app fs - and could be changed, updated dynamically

**Auth & data**

- Phase 1 (MVP): no auth, session-local state only
- Phase 2: Clerk for authentication, Sqlite for user data
- Phase 3: Stripe Billing for subscriptions, usage metering (not implement it)

**Infrastructure**

- Deployment: ubuntu vps with docker/docker compose
- All services must be run in docker 
- Run all in docker on port 3020 (it will be forwarded to valid domain and https, by separate my service)

# **8\. Monetization**

| **Tier** | **Inclusions**                                                  | **Price**               |
| -------- | --------------------------------------------------------------- | ----------------------- |
| Free     | 20 problems, 5 AI reviews/day, basic hints                      | \$0                     |
| **Pro**  | Full library, unlimited AI, mock interviews, weak topic reports | \$5/month or \$50/year |
| Lifetime | Everything in Pro, forever. Launch promo for first 200 users.   | \$149 one-time          |

# **9\. Risks & mitigations**

| **Risk**                                         | **Likelihood** | **Mitigation**                                                                                   |
| ------------------------------------------------ | -------------- | ------------------------------------------------------------------------------------------------ |
| Deepseek API costs make unit economics unviable | Medium         | Rate-limit free tier; cache common prompts; monitor cost per active user weekly                  |
| LeetCode adds AI review features                 | High           | Compete on UX quality and conversational depth, not problem volume                               |
| Low conversion free-to-paid                      | Medium         | Gate AI reviews on free tier; surface paywall at peak engagement moment (after first submission) |
| AI hallucinations on code review                 | Low            | Prompt engineering, add disclaimer, allow user to flag bad feedback                              |

# **10\. Engineering task list**

Priority: P0 = launch blocker · P1 = MVP required · P2 = post-MVP

Effort: S = 0.5 day · M = 1-2 days · L = 3-5 days · XL = 1+ week

## **10.1 Backend & infrastructure**

| **#**   | **Task**                                                      | **Priority** | **Effort** | **Phase** | **Scope** |
| ------- | ------------------------------------------------------------- | ------------ | ---------- | --------- | --------- |
| **B1**  | Set up Node.js + Express project with TypeScript              | **P0**       | S          | Wk 1      | **MVP**   |
| **B2**  | Deepseek API integration - proxy endpoint for AI calls        | **P0**       | M          | Wk 1      | **MVP**   |
| **B3**  | Rate limiting middleware (per-IP, per-session)                | **P0**       | S          | Wk 1      | **MVP**   |
| **B4**  | Problem data store - JSON seed file with 15 problems          | **P0**       | L          | Wk 2      | **MVP**   |
| **B5**  | REST API: GET /problems, GET /problems/:id                    | **P1**       | S          | Wk 2      | **MVP**   |
| **B6**  | REST API: POST /review - submit code, get AI review           | **P0**       | M          | Wk 2      | **MVP**   |
| **B7**  | REST API: POST /hint - contextual hints endpoint              | **P1**       | S          | Wk 2      | **MVP**   |
| **B8**  | REST API: POST /chat - free-form AI conversation              | **P1**       | M          | Wk 3      | **MVP**   |
| **B9**  | Prompt engineering: system prompts for all AI modes           | **P0**       | M          | Wk 3      | **MVP**   |
| **B12** | User auth with Clerk (sign-up, login, JWT)                    | **P1**       | M          | Wk 5      | **Post**  |
| **B13** | Sqlite schema + typeORM (users, sessions, history)            | **P1**       | L          | Wk 5      | **Post**  |
| **B14** | Stripe integration - subscription billing                     | **P3**       | L          | Wk 6      | **Post**  |
| **B15** | Usage metering - track AI calls per user for free tier gate   | **P1**       | M          | Wk 6      | **Post**  |
| **B16** | Admin API - usage stats, user counts, revenue dashboard       | **P2**       | L          | Wk 8      | **Post**  |

## **10.2 Frontend - core UI**

| **#**   | **Task**                                                     | **Priority** | **Effort** | **Phase** | **Scope** |
| ------- | ------------------------------------------------------------ | ------------ | ---------- | --------- | --------- |
| **F1**  | Vite + React + TypeScript project scaffold                   | **P0**       | S          | Wk 1      | **MVP**   |
| **F2**  | Design system: CSS variables, typography, color tokens       | **P0**       | M          | Wk 1      | **MVP**   |
| **F3**  | Three-column layout: sidebar / main / AI panel               | **P0**       | M          | Wk 1      | **MVP**   |
| **F4**  | Navigation bar: logo, track indicator, XP bar, streak badge  | **P2**       | S          | Wk 1      | **MVP**   |
| **F5**  | Topic sidebar with filter chips and progress bars            | **P1**       | S          | Wk 2      | **MVP**   |
| **F6**  | Problem select grid - cards with difficulty badge, topic tag | **P0**       | S          | Wk 2      | **MVP**   |
| **F7**  | Problem detail: description, examples, constraints tabs      | **P0**       | M          | Wk 2      | **MVP**   |
| **F8**  | Hint tab - reveal hint progression                           | **P1**       | S          | Wk 2      | **MVP**   |
| **F9**  | Solution tab - spoiler-gated reference answer                | **P2**       | S          | Wk 2      | **MVP**   |
| **F10** | Countdown timer with warning state (<3 min)                  | **P0**       | S          | Wk 3      | **MVP**   |
| **F11** | Code editor with CodeMirror 6 - JS.                          | **P0**       | L          | Wk 3      | **MVP**   |
| **F12** | Run tests simulation - feedback on partial solutions         | **P1**       | M          | Wk 3      | **MVP**   |
| **F13** | Submit & Review flow - loading state, score card render      | **P0**       | M          | Wk 3      | **MVP**   |
| **F14** | Markdown + code block renderer for AI messages               | **P0**       | S          | Wk 3      | **MVP**   |
| **F15** | AI chat: typing indicator, message history, auto-scroll      | **P0**       | M          | Wk 4      | **MVP**   |
| **F16** | Hint buttons: approach, complexity, edge cases, explain      | **P0**       | S          | Wk 4      | **MVP**   |
| **F17** | XP award animation on submission                             | **P2**       | S          | Wk 4      | **MVP**   |
| **F20** | Auth UI: sign-in, sign-up, account page                      | **P1**       | M          | Wk 5      | **Post**  |
| **F22** | Dashboard: solved history, weak topics, streak calendar      | **P1**       | L          | Wk 6      | **Post**  |

## **10.3 AI & prompt engineering**

| **#**   | **Task**                                                   | **Priority** | **Effort** | **Phase** | **Scope** |
| ------- | ---------------------------------------------------------- | ------------ | ---------- | --------- | --------- |
| **A1**  | System prompt v1: AI interviewer persona and review format | **P0**       | M          | Wk 2      | **MVP**   |
| **A2**  | Prompt: Submit & Review - correctness, Big-O, improvements | **P0**       | M          | Wk 2      | **MVP**   |
| **A3**  | Prompt: tiered hints - abstract → specific → near-solution | **P1**       | S          | Wk 2      | **MVP**   |
| **A4**  | Prompt: code explanation - step-by-step walkthrough        | **P1**       | S          | Wk 3      | **MVP**   |
| **A5**  | Prompt: edge case identification per problem type          | **P1**       | M          | Wk 3      | **MVP**   |
| **A6**  | Prompt: follow-up question generation after review         | **P1**       | S          | Wk 3      | **MVP**   |
| **A7**  | Evaluate AI output quality - manual review of 20 problems  | **P0**       | M          | Wk 4      | **MVP**   |
| **A8**  | Prompt hardening: handle wrong/empty/non-code submissions  | **P1**       | S          | Wk 4      | **MVP**   |
| **A9**  | Weak topic detection - analyse patterns across submissions | **P2**       | L          | Wk 7      | **Post**  |
| **A10** | Mock interview mode prompt - 60-min, 2-problem session     | **P2**       | L          | Wk 8      | **Post**  |

## **10.4 Problem content**

| **#**  | **Task**                                             | **Priority** | **Effort** | **Phase** | **Scope** |
| ------ | ---------------------------------------------------- | ------------ | ---------- | --------- | --------- |
| **C1** | Write 10 Easy problems with full metadata            | **P0**       | L          | Wk 2      | **MVP**   |
| **C2** | Write 20 Medium problems with full metadata          | **P0**       | XL         | Wk 3      | **MVP**   |
| **C3** | Write 10 Hard problems with full metadata            | **P1**       | L          | Wk 3      | **MVP**   |
| **C4** | Write starter templates for all 40 MVP problems      | **P0**       | M          | Wk 3      | **MVP**   |
| **C5** | Write reference solutions for all 40 MVP problems    | **P0**       | M          | Wk 4      | **MVP**   |
| **C6** | Expand library to 100 problems for launch            | **P2**       | XL         | Wk 7      | **Post**  |
| **C7** | Company-specific problem tags (Google, Meta, Amazon) | **P2**       | M          | Wk 8      | **Post**  |

## **10.5 QA, polish & launch**

| **#**  | **Task**                                                     | **Priority** | **Effort** | **Phase** | **Scope** |
| ------ | ------------------------------------------------------------ | ------------ | ---------- | --------- | --------- |
| **Q1** | End-to-end testing: solve 10 problems, validate all AI flows | **P0**       | M          | Wk 4      | **MVP**   |
| **Q2** | Cross-browser testing: Chrome, Firefox, Safari               | **P1**       | S          | Wk 4      | **MVP**   |
| **Q3** | Performance audit: AI response latency < 3s p95              | **P0**       | M          | Wk 4      | **MVP**   |
| **Q4** | Accessibility audit: keyboard nav, ARIA labels               | **P2**       | M          | Wk 7      | **Post**  |
| **Q5** | Write LinkedIn launch post + 30-second demo screen recording | **P1**       | S          | Wk 4      | **MVP**   |
| **Q6** | Landing page: hero, features, pricing, CTA                   | **P0**       | L          | Wk 4      | **MVP**   |
| **Q7** | Set up error monitoring (Sentry)                             | **P2**       | S          | Wk 4      | **MVP**   |
| **Q8** | Analytics: Posthog for user behaviour and funnel tracking    | **P2**       | S          | Wk 5      | **Post**  |
| **Q9** | Onboarding flow: 3-step wizard, first problem recommendation | **P1**       | M          | Wk 6      | **Post**  |

# **11\. Delivery timeline**

| **Week** | **Milestone**    | **Deliverables**                                                    |
| -------- | ---------------- | ------------------------------------------------------------------- |
| **Wk 1** | **Scaffold**     | Project setup, design system, 3-column shell, backend scaffold      |
| **Wk 2** | **Core product** | Problem library, editor, AI review endpoint, 10 Easy problems       |
| **Wk 3** | **AI features**  | All hint modes, chat, 30 Medium/Hard problems, prompt hardening     |
| **Wk 4** | **MVP complete** | QA pass, landing page, screen recording, LinkedIn launch post       |
| **Wk 5** | Auth             | Clerk auth, user accounts, history persistence (sqlite/typeorm)           |
| **Wk 6** | Monetization     | Stripe billing, free tier gates, upgrade flow                       |
| **Wk 7** | Growth           | Dashboard, weak topics, spaced repetition, mobile layout            |
| **Wk 8** | Scale            | Expand to 100 problems, admin dashboard, analytics, mock interviews |

_Weeks 1-4 highlighted in amber = MVP scope. Weeks 5-8 = post-launch growth._

_End of document_
