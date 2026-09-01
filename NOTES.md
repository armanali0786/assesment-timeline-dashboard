# Notes

## Session & token management

Token is stored in `sessionStorage` (`src/api/tokenStore.ts`). Trade-offs considered:

- **vs `localStorage`**: sessionStorage doesn't linger across browser restarts or other tabs
  indefinitely — an XSS payload that runs once doesn't walk away with a token that outlives the
  tab. Still vulnerable to XSS while the tab is open (same as localStorage), but the blast radius
  and lifetime are smaller.
- **vs an httpOnly cookie**: strictly the safest option (immune to XSS entirely), but the backend
  returns the token in the JSON login response body rather than a `Set-Cookie` header, and I don't
  control the backend — cookie storage isn't available here.
- **vs in-memory**: safest against persistence, but fails "a refresh keeps you logged in," which is
  an explicit graded requirement, unless paired with a refresh-token flow the backend doesn't
  expose. Rejected for that reason.

`sessionStorage` was the best fit given those constraints.

- **Centralized header wiring**: one axios instance (`src/api/httpClient.ts`). A request
  interceptor reads the token and attaches `Authorization: Bearer <token>` — no endpoint module
  wires this itself.
- **Restore-on-load**: `AuthContext` checks for a stored token on mount and calls `GET /auth/me`;
  success → authenticated, failure → treated as logged out.
- **Expiry**: the response interceptor checks both the HTTP status and the MES envelope's
  `status_code` for 401 (the backend can report an error in the envelope under an HTTP 200), clears
  the token, and notifies `AuthContext` via a small pub/sub (`onUnauthorized`/`emitUnauthorized`) so
  any open screen reacts without the API layer needing to import React Router.
- React Query's retry policy is aware of this: 401/403/422 are never retried (only 500s/network
  errors are), so an expired session redirects immediately instead of after two wasted round trips.

## Chart performance ("Show individual produces" at 10k–20k markers)

Hand-rolled Canvas2D (`src/dashboard/chart/`), no charting library — SVG/DOM markers don't stay
interactive at this count; canvas draw calls do.

- **Geometry resolved once, not per frame.** `normalize.ts` converts the API response into typed
  `Marker`s exactly once (parsing every timestamp and sorting exactly once, since `first_seen_ts`
  isn't sorted). `geometry.ts` then turns that into typed arrays (`Float32Array`/`Uint8Array`) for
  the current `[domain, width]` inside one `requestAnimationFrame`-batched pass. Hover and the
  brush-zoom interaction never re-touch the source data.
- **Thinning that never drops a FAIL.** Beyond one-marker-per-pixel-column density, PASS markers
  thin to at most one per horizontal pixel column (`geometry.ts`); every FAIL is drawn
  unconditionally — the thinning check is skipped entirely for FAILs, so a defect can never be
  hidden by the optimization.
- **Hover is O(log n).** Binary search (`search.ts`) over a time-sorted marker array, independent
  of how many markers are actually drawn.
- **No per-frame work on mouse move.** The tooltip is a DOM overlay, not a canvas repaint — moving
  the mouse never touches the paint path.

How I convinced myself it stays smooth: I isolated the hot path (sort + thin) from network
variance and benchmarked it directly against synthetic 10k/20k datasets:

```
n=10000: normalize+sort=7.33ms,  geometry=1.96ms, drawn=1615/9999,  1000× hover=0.46ms
n=20000: normalize+sort=12.67ms, geometry=0.30ms, drawn=1786/19998, 1000× hover=0.08ms
```

All comfortably under one 16ms frame. I also drove the app in a real headless browser against the
live backend (login → select a real Line → toggle the switch → shift-drag zoom → hover → double
click reset) and confirmed zero console errors and no visible freeze; a full network round trip for
~5,000 live produce rows updated in ~1.6s, dominated by network time, not compute.

## Time handling (UTC ↔ IST)

All conversion goes through `src/utils/time.ts`: `istWallClockToUtc(date, "HH:MM")` builds the
`time_range` sent to the API, and a UTC-shifted-`Date` trick backs `formatIstTime`/
`formatIstDateTime` for display. Both use a fixed +5:30 offset on epoch milliseconds rather than a
timezone library — India has no DST, so this is exact and avoids pulling in a tz database.

- Shift windows are generated from `shift_timings` (`src/utils/shift.ts`), not hardcoded — each
  entry starts a shift running until the next entry, with the last wrapping to the first across
  midnight.
- Hourly buckets (`src/dashboard/bucketing.ts`) step in exact 60-minute increments from the shift's
  own `from_ts`, not from an absolute clock grid. This matches how the backend's own
  `produce_counts`/cycle-time buckets are generated (verified against the live API — a request with
  `from_ts=03:00Z` returns buckets at `03:00Z, 04:00Z, …`), and it's also why the table's column
  headers land on IST half-hour boundaries (e.g. "08:30 – 09:30") for this backend's shift,
  matching the reference screenshot.
- A segment spanning multiple hour buckets is split at each boundary and each piece's minutes
  credited to that bucket — verified against the spec's own worked example (08:33 → 10:12 runtime
  = 27 / 60 / 12 min across three buckets).

## Assumptions & deviations from the written spec

- **Machine/Line selector**: flattened the full asset tree into one Autocomplete rather than a
  cascading multi-level select — any node is selectable, per "you may let the user pick any node."
  Defaults to the deepest node under the first root on load.
- **"Planned Downtime" row.** The written spec's hourly table lists 9 rows with no bucket for
  classified planned downtime (`type: "planned"`, e.g. `downtime_name: "TEA BREAK"/"LUNCH BREAK"`).
  The live backend does return these. I found this because two hours didn't sum to the expected
  ~60 minutes when only `type: "unknown"` downtime was bucketed. Added a 10th "Planned Downtime"
  row (present in the fuller mockup screenshot) so the per-hour numbers stay internally honest;
  "Unknown Downtime" still strictly means `type: "unknown"`, matching the letter of the spec.
- **Cycle-time units.** Both Ideal and Actual Cycle Time are shown in seconds
  (`ideal_cycle_time_seconds`/`actual_cycle_time_seconds`, as named), rather than converting Actual
  to minutes the way the fuller mockup screenshot does — the written spec never mentions a unit
  conversion, and the mockup's extra rows are explicitly called out as beyond what's being built, so
  I trusted the field name over an unlabeled screenshot convention.
- **Coarse produce markers.** With "Show individual produces" off, the chart plots up to two
  markers per hour (summed PASS / summed FAIL across part models, with the count in the tooltip)
  rather than a per-part-model cumulative line — the written spec asks for markers "coloured by
  result: PASS/FAIL" sourced from `produce_counts`, not the cumulative-sum line chart the fuller
  mockup shows.
- **"Empty shift."** The backend always gap-fills `downtimes` for the entire requested window, even
  on a date with zero activity, so "all response arrays empty" never actually happens. Empty is
  defined instead as no `runtimes` and no `produce_counts`, verified against a real out-of-range
  date (2026-06-01).

## What was cut

Nothing from Part 1 or Part 2 was cut. Everything on the "Out of scope" list (segment
classification dialogs, auto-refresh/polling, CSV/PDF export, i18n, multi-machine drill-down) was
deliberately left unbuilt.

## Data/state approach

`@tanstack/react-query` for all four endpoints: per-filter-combination caching keyed naturally by
`(entityScope, timeRange, exactProduces)`, a retry/backoff policy customized to skip non-transient
errors (401/403/422), and `refetch()` as the manual refresh button's implementation — without
hand-rolling loading/error/retry state for four separate calls. Auth state is a plain React Context
since it's small and doesn't need the caching machinery.
