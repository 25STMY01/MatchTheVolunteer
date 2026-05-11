# Client (React)

React app that runs in the browser. When deployed, it is served by Google Apps Script (`doGet` → `match-the-volunteer.html`) and calls server functions through `gas-client`.

## Structure

```
src/client/
├── api/
│   ├── index.ts           # gas-client → serverFunctions
│   ├── volunteer.ts       # searchVolunteerByCode, getClosestVolunteersForCase
│   └── case.ts            # getCasesList
├── components/
│   ├── VolunteerSearch.tsx   # Search by volunteer code
│   └── CaseSearch.tsx         # Select case, show biodata + closest volunteers
├── pages/
│   └── HomePage.tsx       # Tab switcher (Volunteer | Case)
├── App.tsx
├── index.tsx              # React root
├── index.html             # Entry HTML
└── styles.css
```

## API layer

`api/index.ts` configures `GASClient` and re-exports `serverFunctions`. `volunteer.ts` and `case.ts` wrap those calls for the UI.

| Function                              | Returns                     | Server                                              |
| ------------------------------------- | --------------------------- | --------------------------------------------------- |
| `searchVolunteerByCode(code)`         | `Volunteer` or throws       | `serverFunctions.searchVolunteerByCode`             |
| `getCasesList()`                      | `Case[]`                    | `serverFunctions.getCasesList`                      |
| `getClosestVolunteersForCase(caseId)` | `ClosestVolunteersResponse` | `serverFunctions.getClosestVolunteersForCase`       |

## Components

| Component           | Pattern                                         | Data flow                                                                                                                             |
| ------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **VolunteerSearch** | Search by code. User types code, clicks Search. | Fetches one volunteer on demand.                                                                                                      |
| **CaseSearch**      | Select from dropdown. User picks case.          | Loads all cases for dropdown; fetches closest volunteers when a case is selected. Case biodata comes from the selected case in state. |

## Build

Vite builds the client into a single HTML file (`dist/match-the-volunteer.html`) via `vite-plugin-singlefile`. The GAS `doGet` serves this file. Dev server runs at `https://localhost:3000` (HTTPS required for GAS iframe).
