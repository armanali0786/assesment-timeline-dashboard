# Demo Video Script

Target length: ~4 minutes. Record the browser at 1440px+ width so the chart and table aren't
cramped. Use Line 1, date 2026-06-23 throughout — it has breaks, downtime, and enough produce
volume to make the chart toggle meaningful.

---

## 1. Intro (10s)

**Say:** "This is a timeline dashboard for a machine shift — login, an interactive production
chart, and an hourly downtime summary, built against a real backend."

**Show:** Login screen.

---

## 2. Auth & session (30s)

**Do:** Type a wrong password first, submit.
**Say:** "Bad credentials show inline, no crash."

**Do:** Log in with `analytics_user` / `dashboard123`.
**Say:** "Token comes back in the login response, gets stored, and every call after this attaches
it automatically through one central API client."

**Do:** Refresh the page.
**Say:** "Refreshing doesn't log you out — the session is restored and revalidated against
`/auth/me` before the dashboard renders."

---

## 3. Filter bar (30s)

**Do:** Open the Machine/Line dropdown, select **Line 1**. Set date to **2026-06-23**. Point at the
Shift dropdown.
**Say:** "Machine list and shift times both come from the API — nothing's hardcoded. This backend's
shift is 08:30 to 19:00; a different customer's shifts would just show up here instead."

---

## 4. Timeline chart — the main part (90s)

**Do:** Let the chart render with the toggle off.
**Say:** "Segment bands come straight from the API's runtime/downtime/stoppage arrays — runtime,
breaks, unknown downtime. The dots are hourly PASS/FAIL totals."

**Do:** Turn on **Show individual produces**.
**Say:** "This switches to every individual part for the shift — this backend returns ten to twenty
thousand of these. It's a hand-rolled canvas renderer, not a charting library, specifically so it
stays smooth at that count."

**Do:** Hold Shift, drag across a busy section of the chart to zoom in.
**Say:** "Shift-drag to zoom into a time range."

**Do:** Hover near a few dots to show the tooltip.
**Say:** "Hover shows the exact timestamp and result."

**Do:** Double-click to reset the zoom.

---

## 5. Hourly summary table (30s)

**Do:** Scroll down to the table, point at a couple of columns.
**Say:** "One column per hour, converted from the API's UTC timestamps into IST. Runtime, breaks,
downtime, and cycle time all line up with what the chart above is showing for the same hour."

---

## 6. Edge cases (30s)

**Do:** Change the date to something outside 22–25 June 2026.
**Say:** "No data for a shift shows an explicit empty state instead of a blank chart."

**Do:** Change the date back, then click the refresh button.
**Say:** "Manual refresh — no polling running in the background."

---

## 7. Close (15s)

**Say:** "That's the dashboard — auth, the chart, and the hourly table all wired to the real
backend. Notes on the token storage choice, the chart's performance approach, and timezone
handling are in NOTES.md."

**Show:** Repo file tree or NOTES.md for a second, then end.
