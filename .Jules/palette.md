## 2024-05-18 - Accessibility on Icon-Only Buttons
**Learning:** Icon-only buttons (e.g. ones using Lucide React icons like `Trash2`) lack textual context for screen readers. In the `AdminCategoriesTab` and `AdminQuickLinksTab`, the delete/remove buttons were missing accessibility markers.
**Action:** Always ensure that icon-only buttons include descriptive `aria-label` and `title` attributes. This provides context for screen readers (via `aria-label`) and visual tooltips on hover (via `title`).
