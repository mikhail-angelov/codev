# Task 2

Tune the practice UI for a stronger problem-solving layout.

## Status

- State: implemented in current worktree
- Last checked: 2026-03-24

## Checklist

- [x] Left section fits the available screen height.
- [x] Problem list inside the left section scrolls independently.
- [x] Center section prioritizes the code editor.
- [x] Problem description stays above the editor.
- [x] Constraints and examples move below the JavaScript editor.
- [x] Editor text is larger for easier reading while solving.
- [x] Editor shows only the initial function signature and no reference implementation.

## Implementation Notes

- Sidebar height is pinned to the app viewport and the problem list scrolls inside it.
- Workspace layout renders description first, editor second, and supporting details after the editor.
- CodeMirror font sizing and spacing were increased for the solving flow.
- Public problem payloads now expose an empty starter function body instead of seeded solution logic.

## Verification

- [x] `frontend: npm test -- --run src/components/WorkspacePanel.test.tsx`
- [x] `backend: npm test -- --run tests/problem-repository.test.ts tests/problems-route.test.ts`
