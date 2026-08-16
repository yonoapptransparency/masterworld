## 2025-03-08 - Accessibility for Icon-only Mobile Toggle Button
**Learning:** Found that the main mobile toggle button (`AdminSidebar.tsx`) lacked an `aria-label`, making it inaccessible to screen readers.
**Action:** When adding icon-only toggle buttons in React components, ensure to add dynamic `aria-label` (e.g., 'Open menu' vs 'Close menu'), `aria-expanded`, and `aria-controls` pointing to the ID of the controlled container.
