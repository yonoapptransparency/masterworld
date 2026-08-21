## 2025-08-21 - Accessible Icon-Only Buttons
**Learning:** Found multiple instances where icon-only buttons (like delete buttons with `Trash2` icons) lack `aria-label`s, rendering them inaccessible to screen reader users. Specifically, these are common in dynamically generated lists in the admin panel and other sections.
**Action:** Adding `aria-label` attributes to these icon-only buttons to conform to accessibility standards.
