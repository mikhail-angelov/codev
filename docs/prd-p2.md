# PRODUCT REQUIREMENTS DOCUMENT

# Codev — Phase 2 PRD

| Field | Value |
|---|---|
| Version | 1.0 Phase 2 |
| Date | March 24, 2026 |
| Author | Mikhail Angelov |
| Status | Deferred until MVP validation |
| Depends on | Successful MVP launch and early user validation |

## 1. Purpose

This document captures the features intentionally deferred from the MVP so the product can evolve without bloating the initial build.

Phase 2 begins only after the MVP demonstrates that users value the core experience:

> submit solution → receive AI interviewer feedback → continue improving through conversation

The goal of Phase 2 is to make Codev more persistent, personalized, and monetizable without losing its core UX strength.

## 2. Phase 2 goals

- Add user identity and persistent progress
- Turn one-off sessions into a repeatable practice product
- Introduce monetization controls
- Expand the product from isolated problem practice to broader interview preparation
- Build enough instrumentation to learn which workflows convert and retain users

## 3. Entry criteria for Phase 2

Phase 2 should start only if MVP shows encouraging signs such as:
- repeated usage from early users
- positive feedback on AI review usefulness
- users requesting saved history or progress tracking
- willingness to pay for richer functionality
- stable enough core review/hint/chat infrastructure

## 4. Phase 2 themes

## 4.1 Accounts and persistence

### Objectives
- Let users keep history across sessions
- Preserve solved problems, reviews, and chat context
- Support future premium features cleanly

### Features
- User accounts and authentication
- Persistent submission history
- Saved AI conversations per problem
- Problem bookmarking
- Personal notes per problem

### Suggested implementation direction
- Add auth provider such as Clerk
- Add SQLite or another lightweight persistence layer
- Store users, sessions, problem attempts, saved notes, and review records

## 4.2 Personal progress and retention features

### Objectives
- Help users understand their practice behavior over time
- Encourage repeat practice after MVP validation

### Features
- Solved problem history
- Weak topic summaries
- Difficulty-based progress views
- Streak tracking
- XP or lightweight gamification only if it proves useful
- Dashboard page with recent activity and practice summary

### Notes
These should be treated as retention features, not the core value proposition.

## 4.3 Interview simulation mode

### Objectives
- Expand from problem solving into interview rehearsal
- Test whether users want a more complete mock interview workflow

### Features
- 45–60 minute timed mock session
- 2 problem sequence
- AI interviewer stays in character throughout the session
- End-of-session debrief summarizing:
  - technical correctness
  - communication quality
  - complexity reasoning
  - prioritization of edge cases
  - suggested next steps

### Risks
- Higher prompt complexity
- Longer sessions mean greater model cost
- Requires stronger output consistency than core MVP review

## 4.4 Monetization and plan controls

### Objectives
- Turn user value into sustainable revenue
- Control AI costs while preserving a usable free experience

### Features
- Stripe billing
- plan model: Free / Pro
- Usage metering for AI reviews and chats
- Soft and hard limits on free usage
- Upgrade prompts after high-intent moments

### Recommended approach
Keep pricing simple:
- Free: limited AI reviews per day
- Pro: expanded or unlimited usage plus premium features

Avoid lifetime pricing until real demand and cost profile are validated.

## 4.5 Content expansion

### Objectives
- Increase repeat value after the core loop is validated
- Support more varied practice needs

### Features
- Expand beyond 15 problems
- Add broader topic coverage
- Add company-tagged sets only if users explicitly ask for them
- Add stronger metadata for recommendation and analytics

### Content principle
Expand content quality-first, not quantity-first.

## 4.6 Admin and analytics

### Objectives
- Give visibility into product health and content performance
- Support prompt iteration and monetization decisions

### Features
- Usage analytics dashboard
- Problem popularity and completion funnel
- AI request volume and cost visibility
- Review usefulness tracking
- Conversion metrics for upgrade prompts
- Operational logs and alerting improvements

## 5. Explicitly out of scope for Phase 2

Unless later validated, these remain lower priority:
- social/referral mechanics
- LinkedIn virality features
- broad collaboration features
- multi-language editor support
- large-scale remote judge system
- marketplace/community problem authoring

## 6. Architecture implications

Phase 2 likely introduces the following architecture changes:

### Backend
- authenticated routes
- user-aware rate limiting
- persistence for submissions and chats
- billing webhooks
- usage metering pipeline

### Data
- users
- sessions
- problem attempts
- saved chats
- notes
- plan/subscription state
- aggregated topic-performance signals

### Frontend
- account flows
- dashboard routes
- saved history views
- note-taking UI
- billing/settings UI

## 7. Risks and mitigations

| Risk | Likelihood | Mitigation |
|---|---:|---|
| Persistence and auth add large implementation overhead | Medium | Introduce only after MVP proves value; keep schema narrow initially |
| Monetization adds friction too early | Medium | Gate carefully and place upgrade prompts after value moments |
| Gamification distracts from core product | Medium | Treat XP/streaks as optional, not mandatory |
| Mock interview mode produces inconsistent quality | Medium | Launch behind limited beta with manual review of outputs |
| Content expansion becomes a bottleneck | High | Grow problem set gradually and enforce strong content schema |

## 8. Suggested Phase 2 success metrics

- % of users creating accounts after trying MVP
- repeat weekly practice rate
- % of users viewing saved history
- free-to-paid conversion
- AI cost per active user
- retention uplift after persistence features launch
- completion rate of mock interview sessions

## 9. Recommended rollout order

1. accounts and persistence
2. saved history and notes
3. weak-topic summaries and dashboard
4. monetization and usage metering
5. mock interview mode
6. content expansion and company-tagged sets
7. admin analytics improvements

## 10. Decision rule

Phase 2 should be implemented only after MVP proves that users value the AI interviewer itself.

If MVP does not validate the core review experience, adding auth, billing, dashboards, and mock interviews will increase complexity without solving the real product risk.
