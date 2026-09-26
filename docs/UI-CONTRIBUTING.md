# Consistent UI for developers and AI

**UI-STANDARDS.json is the single approval registry.** It lists approved components, their paths and intended uses, brand tokens, behavior/accessibility rules, dependency owners and limited legacy exceptions. AGENTS.md tells AI contributors to read it. Every page and screen references it in a source comment; no standards text is duplicated across screens.

## Use an approved control

```tsx
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";

<label htmlFor="status">Status</label>
<Select id="status" value={status} onChange={(event) => setStatus(event.target.value)}>
  <option value="all">All statuses</option>
  <option value="pending">Pending</option>
</Select>
<Button type="submit" variant="primary" disabled={saving}>
  {saving ? "Saving…" : "Save"}
</Button>
```

Select preserves native keyboard behavior, native validation, options, refs and form submission. Use it for country/state/timezone, filtering and pagination. Device organization/patient search uses registered ChoicePicker, which composes Input and Select. A richer searchable combobox is not currently approved; propose a shared accessible implementation before adding one.

Button defaults to `type="button"`. Declare `type="submit"` for submit actions. The migration preserves previous native submit behavior with explicit types. `plain` is for icon, tab and inline controls; it is not an unrestricted alternative style system. Use className for layout; add new visual variants centrally.

## Add a new pattern

1. Search `components` in UI-STANDARDS.json and extend an existing component where possible.
2. Implement a shared component and define its props, states, keyboard behavior and accessible naming.
3. Add its name, path, status, intended usage and accessibility contract to the registry. Custom widgets must declare `allowedRoles`. A new native primitive must have a single `nativeOwners` entry.
4. If a library is necessary, add a reviewed `packageApprovals` entry with a specific adapter owner; import it only there. Data-only named helpers can be explicitly allowlisted.
5. Add meaningful behavior tests, migrate callers and run the checks. Include visual evidence and the registry diff for tech-lead review.

Do not mark a new component approved merely to silence the checker. Registration and implementation are reviewed together before merge. Repository administrators should require CI and a tech-lead review through branch protection; this change does not configure GitHub branch protection or invent a CODEOWNERS identity.

## What is enforced

`npm run ui:check` scans all app, feature and shared component source files. It rejects raw button/input/select/textarea/table/dialog elements outside their approved owner, literal custom-widget roles outside approved components or counted legacy exceptions, vendor imports outside adapters, unregistered shared TSX components, stale registry paths, missing screen references and unreviewed runtime dependencies. It also checks that Tailwind scans feature modules. `npm run lint` runs this check, so the existing CI enforces it without a workflow-file permission change.

`npm run test:ui` tests the checker itself. `npm run check` includes those tests. Brand colors are consumed by Tailwind from the registry; shared classes remain in app/globals.css.

## Limits and remaining review work

Static checks do not prove visual consistency or WCAG conformance. Computed JSX roles, generated markup, CSS overrides and complex interaction behavior still require review. The three existing patient modal screens have counted, named exceptions pending a shared accessible Dialog; these are migration debt, not examples for new work. Legacy reference UI remains registered as such and must not be re-enabled as live functionality without real services.

For each UI change, review keyboard/focus behavior, visible labels, error association, pending/empty/error states, narrow mobile layout, 200% zoom and relevant browser tests. Do not introduce new colors, fonts, control heights or competing component libraries through local screen styling.
