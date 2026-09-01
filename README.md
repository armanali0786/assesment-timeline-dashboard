# Timeline Dashboard

Authenticated React dashboard showing an interactive timeline chart and an hourly
production/downtime summary for one machine, date, and shift. Built for the Senior Frontend
take-home assignment.

## Stack

React 18 + TypeScript + Vite, MUI v6, React Router, TanStack Query, axios. No charting library —
the timeline is a hand-rolled Canvas2D component; see [NOTES.md](./NOTES.md) for why.

## Running locally

```bash
npm install
cp .env.example .env   # set VITE_API_BASE_URL if different from the default
npm run dev
```

Log in with the credentials provided for this assignment against the test backend
(`https://fractaldmsdev.centralindia.cloudapp.azure.com` by default — data exists for
22–25 June 2026).

## Build

```bash
npm run build
npm run preview
```

## Project structure

```
src/
├── api/          axios client (envelope unwrap, 401 handling, retry policy), typed endpoint calls
├── auth/         AuthContext, ProtectedRoute
├── layout/       app shell (header, logout)
├── pages/        LoginPage, DashboardPage
├── dashboard/    filter bar, hourly bucketing, hourly table, chart/ (canvas timeline)
└── utils/        UTC↔IST time conversion, shift-window generation, asset-tree flattening
```

See [NOTES.md](./NOTES.md) for the design decisions (token storage, chart performance, time
handling) and documented assumptions/deviations from the written spec.

## Deployment

Not yet deployed. To deploy: connect this repository to Netlify or Vercel, set the
`VITE_API_BASE_URL` environment variable in the host's dashboard, build command `npm run build`,
publish directory `dist`.
