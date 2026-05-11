# Server (Google Apps Script)

Backend code that runs on Google's servers. Handles spreadsheet access, volunteer/case lookups, and distance calculations via the Google Maps **Routes API** (`computeRoutes`).

## Layer overview


| Layer            | Purpose                                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------------------ |
| **Handlers**     | Entry points for client calls. Validate input, orchestrate repos and matching, return typed results.   |
| **Repositories** | Data access. Open spreadsheets, parse rows, map to domain types (Case, Volunteer).                     |
| **Matching**     | Matching logic. Uses Routes API driving distance to find k-nearest volunteers.                        |
| **External**     | Outbound HTTP (Routes API). Reads `GOOGLE_MAPS_API_KEY` from Script Properties.                       |
| **Utils**        | Shared helpers (sheets, header matching).                                                              |


## Key files


| File                                | Description                                                                                                       |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `index.ts`                          | Entry point. `doGet()` serves `match-the-volunteer.html`. Exports server functions for gas-client.                |
| `config.ts`                         | Spreadsheet URLs, sheet names, API key property name.                                                             |
| `handlers/case.ts`                  | `getCasesList()` → Case[]                                                                                         |
| `handlers/volunteer.ts`             | `searchVolunteerByCode(code)` → Volunteer; `getClosestVolunteersForCase(caseId, k)` → ClosestVolunteersResponse   |
| `repository/CaseRepository.ts`      | Opens case spreadsheet, finds header row by "SN", maps rows to Case.                                              |
| `repository/VolunteerRepository.ts` | Opens volunteer spreadsheet, finds header row by "Code Number", maps rows to Volunteer.                           |
| `matching/location.ts`              | Calls `computeRouteMatrix` (batched) for driving distances; sorts; returns top k with `distanceKm`. |
| `external/googleMaps.ts`            | Routes API `computeRouteMatrix` client (Route Matrix). Batched km by row or `{ error }`.                             |


## Build

Server code is compiled by Vite into `dist/code.js` as an IIFE. Exported functions are attached to the global object so GAS can invoke them. The client uses `gas-client` to call these functions when running inside the GAS iframe.

## OAuth scopes (appsscript.json)

- `spreadsheets` — read Volunteer and Case sheets
- `drive` — open spreadsheets by URL
- `script.external_request` — call Google Maps API

