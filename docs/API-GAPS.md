# API integration gaps

This document tracks which screens are wired to a real backend endpoint
and which are still rendering placeholder layout (marked in the UI with
the **"Awaiting backend integration"** banner from `components/MockBanner.tsx`).

Last reviewed: 2026-06-23.

Legend: ✅ wired · ⚠️ partial · ❌ no API yet · 📄 endpoint exists in spec but not wired here yet

---

## Cross-cutting

| Concern | Status |
|---|---|
| Date format (display "1-june-2026", API ISO yyyy-MM-dd) | ✅ `lib/format.ts::formatDate` / `formatDateTime` used everywhere |
| Phone format (display international, store E.164, validate per country) | ✅ `components/PhoneInputField` + `lib/format.ts::formatPhone` / `isValidPhone` |
| Country list | ✅ `i18n-iso-countries` via `lib/countries.ts` |
| States list | ✅ `data/states.json` via `lib/countries.ts::statesForCode` |
| Metadata-driven dropdowns | ✅ `endUserApi.getMetadata()` (occupation, userExpList, devicePurposeList, devicePurchaseList) |

---

## Patient (Individual User)

| Screen | Endpoint | Status |
|---|---|---|
| `/register/patient` step 1–3 | `/metadata` (dropdowns) | ✅ |
| `/register/patient` step 4 (Verify) | `/auth/signUp-otp`, `/auth/validate-otp`, `/users/create-user` | ✅ |
| `/login` (patient) | `/auth/login` | ✅ |
| `/patient/dashboard` | `/event/getDataBySession`, `/event/getLastSyncDate` | ✅ |
| `/patient/devices` | `/event/getLastSyncDate` | ✅ |
| `/patient/reports` | `/event/reportBySession` | ✅ |
| `/patient/sharing` | — | ❌ |
| `/patient/profile` | — | ❌ |

---

## Provider (Homecare Provider)

| Screen | Endpoint | Status |
|---|---|---|
| `/register` (provider variant) | `/home-care/register` | ✅ |
| `/login` (staff) | `/home-care/login` | ✅ |
| `/provider/patients` (list) | `/home-care/devices/users` | ✅ |
| `/provider/patients/[id]/report` | `/home-care/devices/compliance-report` | ✅ |
| `/provider/devices` (claim) | `/home-care/devices/upload` | ✅ |
| `/provider/dashboard` | — | ❌ |
| `/provider/worklist` | — | ❌ |
| `/provider/alerts` | — | ❌ |
| `/provider/reports` (group compliance) | — | ❌ |
| `/provider/patients/new` (create) | — | ❌ |
| `/provider/patients/[id]` (detail panes) | — | ❌ |
| `/provider/patients/[id]/transfer` | — | ❌ |
| `/provider/devices/[serial]` (detail) | — | ❌ |
| `/provider/settings/users` | — | ❌ |
| `/provider/settings/care-monitors` | — | ❌ |
| `/provider/settings/insurance` | — | ❌ |
| `/provider/settings/mask-types` | — | ❌ |
| `/provider/settings/reminders` | — | ❌ |
| `/provider/settings/alerts` | — | ❌ |
| `/provider/settings/sub-accounts` | — | ❌ |
| `/provider/settings/organization` | — | ❌ |
| `/provider/settings/integrations` | — | ❌ |
| `/provider/settings/audit` | — | ❌ |

---

## Monitor (Authorized Monitor)

| Screen | Endpoint | Status |
|---|---|---|
| `/register` (monitor variant) | `/home-care/register` | ✅ |
| `/login` (staff) | `/home-care/login` | ✅ |
| `/monitor/patients` (list) | `/home-care/devices/users` | ✅ |
| `/monitor/patients/[id]` (report) | `/home-care/devices/compliance-report` | ✅ |
| `/monitor/dashboard` | — | ❌ |
| `/monitor/shares` (inbox) | — | ❌ |
| `/monitor/reports` (group compliance) | — | ❌ |
| `/monitor/audit` | — | ❌ |

---

## Super Admin

| Screen | Endpoint | Status |
|---|---|---|
| `/login` (staff) | `/home-care/login` | ✅ |
| `/admin/approvals` | `/home-care/pending`, `/home-care/approve/{id}`, `/home-care/reject/{id}` | ✅ |
| `/admin/dashboard` — Markets card | `/home-care/admin/markets` | ✅ |
| `/admin/dashboard` — pending count / activity / health | — | ⚠️ partial — only Markets is live |
| `/admin/organizations` | `/home-care/admin/clients` (filters), `/home-care/admin/clients/{id}/suspend\|reinstate` | 📄 spec'd, not wired |
| `/admin/audit` (recent activity) | `/home-care/admin/recent-activity?limit=N` | 📄 spec'd, not wired |
| `/admin/users` (admin users) | `/home-care/admin/admins` (GET/POST/PATCH) | 📄 spec'd, not wired |
| `/admin/devices` (fleet) | — | ❌ |
| `/admin/settings` (markets table / feature flags) | — | ❌ |

---

## Next wiring candidates (cheap wins)

These endpoints already exist in the Validation Reference doc and would
delete a chunk of the mock UI in one pass:

1. **`/home-care/admin/dashboard`** → drop the mock stats on `/admin/dashboard`.
2. **`/home-care/admin/recent-activity?limit=10`** → power `/admin/audit` *and* the dashboard's "Recent activity" card.
3. **`/home-care/admin/clients`** → drive `/admin/organizations` with real list + filters; the suspend/reinstate buttons can hit `/clients/{id}/suspend|reinstate` directly.
4. **`/home-care/admin/admins`** → drive `/admin/users` (Super Admin only).

The patient-side `sharing` / `profile`, the provider's `worklist` /
`alerts` / `settings/*`, and the monitor's `dashboard` / `shares` /
`audit` need new backend endpoints — they're listed for the backend
team to triage.
