# Contributor instructions (developers and AI)

## UI changes

Read **UI-STANDARDS.json** before editing any screen. It is the single approval registry for components, design tokens, packages and UI behavior. These instructions apply to the entire repository.

- Reuse the approved shared component. All dropdowns use `components/ui/Select.tsx`; never add a screen-local select or another dropdown library.
- Use approved Button, Input, Textarea and Table components. Reuse registered password, phone, date-of-birth, page-header and other composite components.
- Keep screen files marked with `// UI standard: UI-STANDARDS.json`. This references the central rules; do not copy the rules into every screen.
- Use variants and design tokens. Use per-screen classes for layout, not to independently redesign controls.
- Before introducing a reusable UI pattern, search the registry. If missing, implement it in `components/ui/`, add its registry entry in the same change, describe accessibility and states, and add relevant tests. An entry is a proposal for tech-lead review, not permission to bypass review.
- New UI dependencies require a package approval entry and a registered adapter. Screens import the adapter, never the vendor directly. Do not broaden allowlists or legacy exceptions just to make checks pass.
- Keep UI rendering separate from API calls and business logic. Follow docs/ARCHITECTURE.md.
- Run `npm run ui:check`, `npm run test:ui`, `npm run typecheck`, `npm run lint` and relevant tests. For visual changes check mobile, keyboard navigation, focus, labels and loading/empty/error states.

See docs/UI-CONTRIBUTING.md for examples and the review checklist. Automated checks enforce concrete boundaries; they do not replace visual or accessibility review.
