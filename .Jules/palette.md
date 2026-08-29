## 2024-05-18 - Accessible Icon-only Buttons Pattern
**Learning:** Icon-only buttons (like Trash2 or Edit2) across the admin components frequently lack screen reader context, keyboard focus indicators, and visual hover tooltips, presenting a recurring accessibility issue pattern.
**Action:** Establish a reusable pattern for all icon-only buttons: require `aria-label` for screen readers, `title` for visual tooltips, and explicit keyboard focus styles (`focus-visible:ring-2 focus:outline-none focus-visible:ring-blue-500` or similar depending on the context).
