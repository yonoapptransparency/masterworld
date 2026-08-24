## 2024-05-19 - Accessible Names for Icon-Only Buttons
**Learning:** Found multiple instances in the Admin dashboard components where icon-only buttons (using `Trash2` or `X` icons) were missing accessible names, leading to a poor experience for screen reader users and missing visual hover hints.
**Action:** Always ensure that icon-only interactive elements contain `aria-label` and `title` attributes that succinctly describe their action (e.g., "Delete banner", "Clear search") for improved accessibility and usability.
