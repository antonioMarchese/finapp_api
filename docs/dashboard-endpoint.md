# Dashboard Endpoint — React Integration Guide

This document describes how a React frontend should consume the
`GET /dashboard` endpoint exposed by the FinApp backend, which returns
income, expense, and balance aggregates grouped by month for an optional
date range.

---

## 1. Endpoint Reference

### URL

```
GET {API_BASE_URL}/dashboard
```

The default backend port is `3001` (see `src/main.ts`). For local
development the base URL is typically `http://localhost:3001`.

### Query Parameters

| Name        | Type            | Required | Description                                                |
| ----------- | --------------- | -------- | ---------------------------------------------------------- |
| `startDate` | ISO 8601 string | No       | Inclusive lower bound of the `dueDate` range (e.g. `2026-01-01`). |
| `endDate`   | ISO 8601 string | No       | Inclusive upper bound of the `dueDate` range (e.g. `2026-12-31`). |

Notes:

- When **both** `startDate` and `endDate` are supplied, the response
  contains an entry for **every month** in that range, including months
  with no transactions (`income: 0`, `expense: 0`, `balance: 0`).
- When the range is omitted (or partial), only months that contain
  transactions appear in the response.
- The repository normalizes `startDate` to `00:00:00 UTC` and `endDate`
  to `23:59:59 UTC`, so callers do not need to attach a time component.

### Response — `200 OK`

The body is a JSON object keyed by `YYYY-MM` (calendar month, UTC).
Each value carries the three totals for that month.

```json
{
  "2026-01": { "income": 5400, "expense": 1820.5, "balance": 3579.5 },
  "2026-02": { "income": 0,    "expense": 0,      "balance": 0      },
  "2026-03": { "income": 4200, "expense": 2300,   "balance": 1900   }
}
```

`balance` is always `income - expense`. Investments are excluded from
all three values.

### Errors

The endpoint inherits NestJS default error handling. Network failures,
500 responses, or malformed query params should be surfaced to the user
through the frontend's standard error UI.

---

## 2. TypeScript Contract for the Frontend

Mirror the backend DTO so that React components have first-class typing.

```ts
// src/api/types/monthlySummary.ts
export interface MonthlySummary {
  income: number;
  expense: number;
  balance: number;
}

export type MonthlySummaryResponse = Record<string, MonthlySummary>;

export interface DashboardFilters {
  startDate?: string; // 'YYYY-MM-DD'
  endDate?: string;   // 'YYYY-MM-DD'
}
```

---

## 3. API Client

### Plain `fetch` wrapper

```ts
// src/api/dashboard.ts
import type {
  DashboardFilters,
  MonthlySummaryResponse,
} from './types/monthlySummary';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001';

export async function getDashboard(
  filters: DashboardFilters = {},
  signal?: AbortSignal,
): Promise<MonthlySummaryResponse> {
  const params = new URLSearchParams();
  if (filters.startDate) params.set('startDate', filters.startDate);
  if (filters.endDate) params.set('endDate', filters.endDate);

  const url = `${API_BASE_URL}/dashboard${params.toString() ? `?${params}` : ''}`;
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(`Dashboard request failed: ${response.status}`);
  }

  return (await response.json()) as MonthlySummaryResponse;
}
```

### Axios variant (if the project already uses Axios)

```ts
import axios from 'axios';
import type {
  DashboardFilters,
  MonthlySummaryResponse,
} from './types/monthlySummary';

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });

export const getDashboard = (filters: DashboardFilters = {}) =>
  api
    .get<MonthlySummaryResponse>('/dashboard', { params: filters })
    .then((r) => r.data);
```

---

## 4. Data Hooks

### React Query (recommended)

```ts
// src/hooks/useDashboard.ts
import { useQuery } from '@tanstack/react-query';
import { getDashboard } from '../api/dashboard';
import type { DashboardFilters } from '../api/types/monthlySummary';

export function useDashboard(filters: DashboardFilters) {
  return useQuery({
    queryKey: ['dashboard', filters.startDate, filters.endDate],
    queryFn: ({ signal }) => getDashboard(filters, signal),
    staleTime: 60_000,
  });
}
```

### Bare `useEffect` alternative

```ts
import { useEffect, useState } from 'react';
import { getDashboard } from '../api/dashboard';
import type {
  DashboardFilters,
  MonthlySummaryResponse,
} from '../api/types/monthlySummary';

export function useDashboard(filters: DashboardFilters) {
  const [data, setData] = useState<MonthlySummaryResponse>();
  const [error, setError] = useState<Error>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    getDashboard(filters, controller.signal)
      .then(setData)
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [filters.startDate, filters.endDate]);

  return { data, error, loading };
}
```

---

## 5. Transforming for Charts and Tables

The response is a map keyed by month. To display it chronologically, map
it to a sorted array.

```ts
import type { MonthlySummaryResponse } from '../api/types/monthlySummary';

export interface MonthlyRow {
  month: string;       // 'YYYY-MM'
  label: string;       // 'Jan 2026'
  income: number;
  expense: number;
  balance: number;
}

const formatLabel = (month: string) => {
  const [year, m] = month.split('-').map(Number);
  return new Date(Date.UTC(year, m - 1, 1)).toLocaleString('default', {
    month: 'short',
    year: 'numeric',
  });
};

export function toMonthlyRows(
  summary: MonthlySummaryResponse,
): MonthlyRow[] {
  return Object.entries(summary)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, totals]) => ({
      month,
      label: formatLabel(month),
      ...totals,
    }));
}
```

This `MonthlyRow[]` shape feeds directly into Recharts, Chart.js, MUI
DataGrid, or a simple `<table>` render.

---

## 6. Example Component

```tsx
// src/components/Dashboard.tsx
import { useMemo, useState } from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { toMonthlyRows } from '../utils/toMonthlyRows';

export function Dashboard() {
  const [filters, setFilters] = useState({
    startDate: '2026-01-01',
    endDate: '2026-12-31',
  });

  const { data, loading, error } = useDashboard(filters);
  const rows = useMemo(() => (data ? toMonthlyRows(data) : []), [data]);

  if (loading) return <p>Loading…</p>;
  if (error) return <p>Failed to load dashboard.</p>;

  return (
    <section>
      <header>
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) =>
            setFilters((f) => ({ ...f, startDate: e.target.value }))
          }
        />
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) =>
            setFilters((f) => ({ ...f, endDate: e.target.value }))
          }
        />
      </header>

      <table>
        <thead>
          <tr>
            <th>Month</th>
            <th>Income</th>
            <th>Expense</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.month}>
              <td>{r.label}</td>
              <td>{r.income.toFixed(2)}</td>
              <td>{r.expense.toFixed(2)}</td>
              <td>{r.balance.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
```

---

## 7. CORS and Environment

The backend runs at `http://localhost:3001` by default and currently
does **not** call `app.enableCors()`. To consume the endpoint from a
React dev server (Vite at `5173`, CRA at `3000`, etc.) one of the
following must be in place:

1. **Backend**: enable CORS in `src/main.ts`:
   ```ts
   app.enableCors({ origin: 'http://localhost:5173', credentials: true });
   ```
2. **Frontend**: configure a dev proxy. Vite example (`vite.config.ts`):
   ```ts
   server: {
     proxy: { '/dashboard': 'http://localhost:3001' },
   }
   ```

Set `VITE_API_BASE_URL` (or the equivalent env var for your bundler)
per environment so production builds point at the deployed backend.

---

## 8. Testing the Integration

- **Unit test** the API client with a mocked `fetch` / `axios` returning
  a canned `MonthlySummaryResponse`.
- **Hook test** with `@testing-library/react` and a React Query
  `QueryClient` configured with `retry: false`.
- **E2E** (Playwright/Cypress): seed a known set of transactions, hit
  `/dashboard?startDate=2026-01-01&endDate=2026-03-31`, and assert the
  table renders three rows with the expected totals.

---

## 9. Quick Checklist

- [ ] `VITE_API_BASE_URL` (or equivalent) configured per environment.
- [ ] CORS enabled on the backend or dev proxy configured.
- [ ] `MonthlySummary` / `MonthlySummaryResponse` types added.
- [ ] `getDashboard` API client implemented.
- [ ] `useDashboard` hook (React Query or `useEffect`) wired up.
- [ ] Component renders sorted monthly rows.
- [ ] Loading and error states handled.
- [ ] Unit + E2E tests covering the happy path and an empty range.
