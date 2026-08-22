## 2024-05-18 - Missing ARIA labels on Icon-only Action Buttons
**Learning:** Icon-only action buttons (like Trash2 used for removing/deleting items in lists) often lack semantic meaning for screen reader users when built with Lucide React icons in this codebase.
**Action:** Always ensure that `<button>` elements containing only an `<Icon />` component also have descriptive `aria-label` and `title` attributes.
