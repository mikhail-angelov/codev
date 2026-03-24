# tasks.md

# Codev MVP - Development Tasks

## Working rules
- Keep tasks small and testable.
- Build in this order: foundation -> backend core -> frontend shell -> solve flow -> AI flow -> polish -> deploy.
- Do not add Phase 2 features during MVP implementation.
- MVP is JavaScript-only.
- Problem library target is 15 curated problems max.
- Session behavior is local-only for MVP.
- Every completed task should leave the app in a runnable state.

## Definition of done for each task
A task is done only when all of the following are true:
- code is implemented
- manual verification passes
- relevant tests are added or updated
- no obvious dead code or placeholder logic remains for that task

---

## 0. Foundation

### [x] T001 - Create repository structure
**Goal**
Create the initial project layout for frontend, backend, and shared config.

**Do**
- Create `frontend/`
- Create `backend/`
- Add root `README.md`
- Add root `.gitignore`
- Add root `docker-compose.yml`
- Add root `.env.example`

**Accept**
- Repository has clear frontend/backend separation
- Root README explains how to run both apps
- Docker compose file exists with service placeholders

---

### [x] T002 - Initialize backend app
**Goal**
Create a minimal backend service skeleton.

**Do**
- Set up Node.js + Express + TypeScript
- Add scripts for dev, build, start, test
- Add env loading
- Add `GET /health`
- Add centralized error middleware

**Accept**
- Backend starts locally
- `GET /health` returns 200 JSON
- TypeScript build passes

**Test**
- Add backend test for `/health`

---

### [x] T003 - Initialize frontend app
**Goal**
Create a minimal frontend service skeleton.

**Do**
- Set up React + TypeScript + Vite
- Add global styles
- Add base layout shell placeholder
- Add scripts for dev, build, preview, test

**Accept**
- Frontend starts locally
- Base app renders with no console errors
- Build passes

---

### [x] T004 - Add Docker local development setup
**Goal**
Make frontend and backend run together consistently.

**Do**
- Add backend Dockerfile
- Add frontend Dockerfile
- Wire both services in `docker-compose.yml`
- Make backend URL configurable from frontend env

**Accept**
- `docker compose up` starts frontend and backend
- Frontend can reach backend `/health`

---

## 1. Backend core

### [x] T005 - Define problem content schema
**Goal**
Create a stable validated structure for seeded problems.

**Do**
- Define TypeScript type/schema for problem records
- Include:
  - id
  - slug
  - title
  - difficulty
  - topic
  - description
  - examples
  - constraints
  - starterTemplate
  - hints
  - referenceSolution
  - sampleTests
- Add validation on load

**Accept**
- Problem seed file is validated at startup
- Invalid problem entries fail with readable error output

**Test**
- Add tests for valid and invalid problem records

---

### [x] T006 - Add first 5 seeded problems
**Goal**
Create the first usable content batch.

**Do**
- Add 5 curated problems from different topics
- Include complete metadata for each problem
- Include JavaScript starter template for each
- Include hint progression for each
- Include visible sample tests for each

**Accept**
- Backend loads all 5 problem seeds successfully
- All 5 records pass schema validation

---

### [x] T007 - Implement problem repository loader
**Goal**
Load problem content through one backend abstraction.

**Do**
- Add module/service that loads and exposes problem data
- Support list retrieval
- Support get-by-id or get-by-slug retrieval
- Prevent leaking internal-only fields where not needed

**Accept**
- Backend has one place responsible for problem loading
- Missing problem returns a clean not-found result

---

### [x] T008 - Implement public problems API
**Goal**
Expose problem library to the frontend.

**Do**
- Add `GET /problems`
- Add `GET /problems/:id`
- Return safe public fields only

**Accept**
- List endpoint returns all visible problems
- Detail endpoint returns one problem
- Unknown problem id returns 404

**Test**
- Add API tests for list/detail/not-found

---

### [x] T009 - Add request validation layer
**Goal**
Reject malformed POST requests consistently.

**Do**
- Add schema validation for AI endpoints
- Standardize validation error response shape

**Accept**
- Invalid payloads return 400 with readable field-level messages

**Test**
- Add tests for malformed request bodies

---

### [x] T010 - Add AI provider wrapper
**Goal**
Isolate the model integration behind one backend service.

**Do**
- Create DeepSeek provider module
- Centralize API config
- Add timeout handling
- Normalize provider failures into app-level errors

**Accept**
- Backend uses one AI entry point
- Provider timeout and API failure are handled predictably

**Test**
- Unit tests with mocked provider responses and failures

---

### [x] T011 - Build review prompt module
**Goal**
Create a structured review prompt builder.

**Do**
- Build prompt module for review mode
- Inputs:
  - problem
  - current code
  - optional sample test result summary
- Ask model for:
  - correctness assessment
  - time complexity
  - space complexity
  - 1-2 concrete improvements
  - 1 follow-up interview question

**Accept**
- Prompt builder output is deterministic in structure
- No editable JSON prompt files are used

**Test**
- Unit tests for prompt payload shape

---

### [x] T012 - Implement `POST /review`
**Goal**
Enable the core AI review loop.

**Do**
- Accept problem id + user code + latest test summary
- Load problem context
- Call AI provider through review prompt module
- Return structured review response

**Accept**
- Valid request returns structured review JSON
- Unknown problem id returns 404
- Empty code returns 400

**Test**
- Endpoint tests with mocked AI provider

---

### [x] T013 - Build hint prompt module
**Goal**
Support contextual hint generation.

**Do**
- Build hint modes:
  - approach
  - complexity
  - edge-cases
  - explain-current-code
- Use problem + current code + hint mode as inputs

**Accept**
- Prompt builder supports all required hint modes
- Output format is consistent across modes

**Test**
- Unit tests for all hint modes

---

### [x] T014 - Implement `POST /hint`
**Goal**
Expose contextual hints to the frontend.

**Do**
- Accept problem id + user code + hint mode
- Return a hint response for the selected mode

**Accept**
- Valid hint mode returns response
- Invalid hint mode returns 400

**Test**
- Endpoint tests for valid and invalid modes

---

### [x] T015 - Build chat prompt module
**Goal**
Support free-form problem-specific follow-up.

**Do**
- Build prompt using:
  - problem context
  - current code
  - recent thread messages
- Trim thread history to a safe bounded size

**Accept**
- Prompt has problem and code awareness
- Excessively long thread history is trimmed safely

**Test**
- Unit tests for history trimming and payload structure

---

### [x] T016 - Implement `POST /chat`
**Goal**
Expose free-form AI discussion endpoint.

**Do**
- Accept problem id + current code + recent messages + user message
- Return contextual AI reply

**Accept**
- Valid request returns contextual reply
- Invalid request returns 400

**Test**
- Endpoint tests with mocked AI provider

---

### [x] T017 - Add rate limiting for AI endpoints
**Goal**
Protect the MVP backend from basic abuse.

**Do**
- Add per-IP or per-session rate limits for:
  - `/review`
  - `/hint`
  - `/chat`

**Accept**
- Excess AI requests return 429
- Non-AI endpoints are unaffected

**Test**
- Add rate limit tests

---

### [x] T018 - Add structured backend logging
**Goal**
Make debugging and failure tracing possible.

**Do**
- Add request id
- Log endpoint, status, and latency
- Log AI provider failures without leaking secrets

**Accept**
- Logs make AI request failures diagnosable
- Logs do not expose secrets or raw credentials

---

## 2. Frontend shell

### [x] T019 - Build base layout shell
**Goal**
Create the core three-column app layout.

**Do**
- Add sidebar area
- Add coding workspace area
- Add AI panel area
- Add desktop-first layout behavior

**Accept**
- Three-column structure renders consistently
- Layout remains stable when switching problems

---

### [x] T020 - Add design tokens and base UI primitives
**Goal**
Create consistent styling for core surfaces.

**Do**
- Add CSS variables for colors, spacing, typography, borders
- Add reusable panel/card/button/input styles
- Add code typography styles

**Accept**
- Main app surfaces use shared design tokens
- Core layout does not depend on ad hoc styling

---

### [x] T021 - Implement problem list sidebar
**Goal**
Allow users to browse available problems.

**Do**
- Fetch problem list from backend
- Render title, difficulty, and topic
- Add selection state

**Accept**
- User can see all available problems
- Selecting a problem updates the main panel

**Test**
- Component tests for loading, loaded, and empty states

---

### [x] T022 - Implement problem detail panel
**Goal**
Show the selected problem clearly.

**Do**
- Render title
- Render description
- Render examples
- Render constraints

**Accept**
- Selected problem details render correctly
- Loading and error states are handled

**Test**
- Component tests for detail rendering and error state

---

### [x] T023 - Add topic filter
**Goal**
Support simple problem browsing by topic.

**Do**
- Add topic filter control in sidebar
- Filter visible problems client-side or server-side

**Accept**
- Topic filter changes visible problem list correctly

**Test**
- Component tests for topic filter behavior

---

## 3. Editor and solve flow

### [x] T024 - Integrate CodeMirror editor
**Goal**
Provide the JavaScript coding surface.

**Do**
- Add CodeMirror 6
- Load starter template when a problem is selected
- Support typing and editing

**Accept**
- Editor renders
- Switching problem loads the correct starter template

**Test**
- Component test for starter template load

---

### [x] T025 - Add local working state for current problem
**Goal**
Preserve the user's current edits during the active session.

**Do**
- Store current code in local client state
- Keep state per selected problem for current browser session only

**Accept**
- Switching away and back within session preserves working code for that problem
- No backend persistence is introduced

---

### [x] T026 - Add editor action bar
**Goal**
Support the basic solving workflow.

**Do**
- Add reset button
- Add run sample tests button
- Add submit for review button
- Add elapsed timer display

**Accept**
- Reset restores starter template
- Buttons reflect valid enabled/disabled state
- Timer starts when a problem session begins

---

### [x] T027 - Define sample test execution contract
**Goal**
Create the MVP run-tests mechanism with explicit limits.

**Do**
- Define how visible sample tests are executed
- Limit scope to visible sample tests only
- Return pass/fail/error summary structure

**Accept**
- Execution contract is explicit and constrained
- No full remote judge behavior exists

---

### [x] T028 - Implement run sample tests flow
**Goal**
Let users run visible sample tests before review.

**Do**
- Execute current code against visible sample tests
- Produce structured summary:
  - passed count
  - failed count
  - failure messages
  - runtime error if any

**Accept**
- User can run visible sample tests from the UI
- Passing, failing, and crashing states are distinct

---

### [x] T029 - Build sample test results UI
**Goal**
Present test results clearly.

**Do**
- Show pass/fail/error state
- Show sample-level results
- Show runtime errors clearly

**Accept**
- User can understand whether code passed, failed, or crashed

**Test**
- Component tests for pass/fail/error rendering

---

## 4. AI review flow

### [x] T030 - Connect submit-for-review flow
**Goal**
Wire the main review action end to end.

**Do**
- Send problem id + current code + latest sample test summary to `/review`
- Add request loading state
- Add error state
- Store review response in client state

**Accept**
- User can submit code and receive AI review
- Consecutive submissions replace or append according to defined behavior

**Test**
- Integration tests with mocked API

---

### [x] T031 - Build review renderer
**Goal**
Present AI review in a structured readable format.

**Do**
- Render:
  - correctness
  - time complexity
  - space complexity
  - improvements
  - follow-up question
- Support basic markdown/code formatting if needed

**Accept**
- Review output is easy to scan and use

---

### [x] T032 - Build AI panel conversation model
**Goal**
Unify reviews, hints, and chat into one visible thread.

**Do**
- Define message types for review, hint, user chat, AI chat
- Render message list
- Add auto-scroll
- Add loading state inside the AI panel

**Accept**
- AI panel can display multiple interaction types in one thread
- Thread remains usable after many messages

---

### [x] T033 - Add hint action controls
**Goal**
Provide guided hint entry points.

**Do**
- Add buttons for:
  - Approach
  - Complexity
  - Edge cases
  - Explain current code
- Call `/hint` with selected mode

**Accept**
- Clicking a hint action adds a hint response to the AI panel

**Test**
- Component tests for hint action dispatch

---

### [x] T034 - Add free-form follow-up chat input
**Goal**
Let users ask problem-specific AI follow-up questions.

**Do**
- Add message input and send action
- Send recent thread context + problem + current code to `/chat`
- Append user and AI messages to the thread

**Accept**
- User can ask follow-up questions tied to current code and problem

**Test**
- Integration test for sending message and rendering reply

---

## 5. Session behavior and state rules

### [x] T035 - Add Zustand store for app state
**Goal**
Create a clear local state layer.

**Do**
- Store:
  - selected problem
  - problem list
  - topic filter
  - current code per problem
  - sample test result per problem
  - elapsed timer state
  - AI thread per problem or active session

**Accept**
- Core state is not fragmented across many unrelated components
- State transitions are predictable

**Test**
- Add store tests for core state updates and selectors

---

### [x] T036 - Define and implement problem-switch behavior
**Goal**
Make session behavior explicit and predictable.

**Do**
- Decide and implement what happens on problem switch for:
  - timer
  - AI thread
  - sample test result
  - current code
- Document chosen rules in code comments or a short dev note

**Accept**
- Switching problems does not create confusing mixed state

**Test**
- State tests for problem switch behavior

---

## 6. Content expansion

### [x] T037 - Expand problem library from 5 to 10 problems
**Goal**
Increase problem coverage while keeping quality high.

**Do**
- Add 5 more curated problems
- Ensure schema validity and content completeness

**Accept**
- 10 valid problems load successfully

**Test**
- Add or update validation tests for the expanded seed set

---

### [x] T038 - Expand problem library from 10 to 15 problems
**Goal**
Reach the planned MVP problem count.

**Do**
- Add final 5 curated problems
- Keep topic distribution aligned with the PRD

**Accept**
- 15 valid problems load successfully
- Each has starter code, hints, reference solution, and sample tests

**Test**
- Add or update validation tests for the full 15-problem seed set

---

## 7. Reliability and polish

### [x] T039 - Add complete loading, empty, and error states
**Goal**
Prevent broken-feeling UX across the app.

**Do**
- Cover:
  - problem list
  - problem detail
  - sample tests
  - review request
  - hint request
  - chat request

**Accept**
- All major flows fail gracefully with readable feedback

**Test**
- Add component or integration tests for representative loading and error states

---

### [x] T040 - Add backend smoke tests for core API flows
**Goal**
Protect the main backend paths.

**Do**
- Cover:
  - `/health`
  - `/problems`
  - `/problems/:id`
  - `/review`
  - `/hint`
  - `/chat`

**Accept**
- Main backend flows have smoke coverage

---

### [x] T041 - Add frontend integration smoke tests for core loop
**Goal**
Protect the primary user journey.

**Do**
- Cover:
  - browse problems
  - select problem
  - edit code
  - run sample tests
  - submit for review
  - request hint
  - ask follow-up question

**Accept**
- Core MVP flow has end-to-end or integration smoke coverage

---

### [x] T042 - Add simple AI usefulness feedback signal
**Goal**
Support MVP learning around review usefulness.

**Do**
- Add thumbs up/down or 1-5 lightweight control for review usefulness
- Record feedback locally or send to simple backend log endpoint if implemented without expanding scope

**Accept**
- Early users can leave usefulness feedback on review results
- Implementation does not require auth or a full analytics system

**Test**
- Add frontend test for feedback interaction and local recording behavior if applicable

---

### [x] T043 - Add minimal landing page
**Goal**
Provide a shareable entry page without delaying the product.

**Do**
- Add simple public page with:
  - product headline
  - value proposition
  - CTA into app

**Accept**
- Landing page exists and links into the app
- Scope remains minimal and does not block core flows

**Test**
- Add a basic route or render test for landing-page navigation into the app

---

## 8. Deployment and launch readiness

### [x] T044 - Prepare production env and deployment config
**Goal**
Make VPS deployment reproducible.

**Do**
- Add production env example
- Ensure ports are configurable
- Add Docker Compose production notes
- Document reverse proxy expectations in README

**Accept**
- App can be deployed to Ubuntu VPS with Docker Compose

**Test**
- Manually verify documented production env and compose configuration on a fresh setup

---

### [ ] T045 - Run manual MVP verification checklist
**Goal**
Confirm the product is launchable.

**Do**
Verify all of the following manually:
- browse available problems
- select one problem
- read description, examples, and constraints
- edit JavaScript starter code
- run sample tests
- submit solution for AI review
- receive structured review result
- request multiple hint types
- ask free-form follow-up questions
- recover gracefully from API failures

**Accept**
- No blocker bugs remain in the core loop
- MVP matches the feature checklist in `prd-mvp.md`

---

## Explicitly not part of this tasks.md
Do not add these during MVP execution unless the scope is deliberately reopened:
- auth
- persistent submission history
- billing
- subscription enforcement
- usage metering by account
- weak-topic detection
- mock interview mode
- bookmarking
- notes
- company-tagged sets
- admin dashboards
- referrals
- streaks
- XP system
- progress bars
- mobile-first optimization
- large library expansion
