# VitaCore Architecture Design

This document summarizes the current VitaCore application structure, module responsibilities, and recent refactoring boundaries. Security-specific details are documented separately in [security.md](./security.md).

## Architecture Overview

VitaCore follows a client-server architecture with a layered backend.

```text
React / Vite frontend
        |
        v
Express routes and controllers
        |
        v
Service layer
        |
        v
MariaDB through dbQuery / mysql2
```

The frontend is responsible for presentation, local interaction state, and API calls. The backend is responsible for authentication, authorization, validation, measurement processing, device verification, security event logging, and database access.

## Request Flow

1. The frontend sends API requests through `frontend/src/api`.
2. Express routes receive the request and attach route-specific middleware.
3. Controllers normalize request and response handling.
4. Validators reject invalid input before service logic runs.
5. Services apply domain logic and database operations.
6. Responses are returned in the existing API shape used by the frontend.

## Backend Module Responsibilities

| Module | Responsibility |
| --- | --- |
| `src/routes` | API endpoint registration and middleware composition. |
| `src/controllers` | Request handling, service calls, and response formatting. |
| `src/validators` | Request body and parameter validation. |
| `src/middlewares` | Authentication and request-level checks. |
| `src/services/authService.js` | Signup, login, email verification, account recovery, and account lifecycle logic. |
| `src/services/measurementService.js` | Measurement create/read flow, device measurement handling, manual updates, and security logging orchestration. |
| `src/services/measurement/measurementMapper.js` | Pure mapping helpers for vital units, ISO timestamps, monitor objects, and API measurement response objects. |
| `src/services/measurement/measurementRules.js` | Pure measurement rules such as RR derivation and anomaly detection thresholds. |
| `src/services/securityEventService.js` | Security event write, archive, and query behavior. |
| `src/services/devicePolicyService.js` | Device activity and expiration policy checks. |
| `src/config/db.js` | MariaDB pool creation and startup connection check. |
| `src/utils/dbQuery.js` | Shared database query wrapper. |
| `src/templates/emailTemplates.js` | Email template generation. |

## Frontend Module Responsibilities

| Module | Responsibility |
| --- | --- |
| `src/App.jsx` | Application route composition and page selection. |
| `src/api` | Backend API client and endpoint-specific API functions. |
| `src/pages` | Page-level data loading, user actions, and screen composition. |
| `src/components` | Reusable UI and domain display components. |
| `src/utils/vitals.js` | Vital defaulting, parsing, and display-oriented vital helpers. |
| `src/utils/vitalCharts.js` | Chart data helpers for vital views. |
| `src/utils/securityEventDisplay.js` | Character security event filtering, sorting, compaction, and display message mapping. |
| `src/utils/characterCommands.js` | Character command message map and command input parsing. |
| `src/assets/styles` | Page and component CSS. |

## Data Flow

Measurements are represented as records rather than in-place overwrites. Manual corrections and simulation results can reference an original measurement with `original_measurement_id`, while `source_type` separates `device`, `simulation`, and `manual` records.

Security events are stored in `security_events`. Older events can be archived into `security_event_archives`.

## Recent Refactoring Notes

The measurement service previously contained pure formatting and rule helpers inline. These helpers were moved into:

- `measurementMapper.js` for response and display mapping.
- `measurementRules.js` for measurement-derived values and anomaly checks.

The Character page previously contained display-specific security event and command parsing helpers inline. These helpers were moved into:

- `securityEventDisplay.js` for event message filtering and compaction.
- `characterCommands.js` for command message lookup and command input parsing.

These changes reduce page/service size without changing API response shape, DB schema, UI design, or security policy.

## Design Constraints

- The frontend must not access the database directly.
- API response formats should remain stable for existing frontend calls.
- Database schema changes should be handled deliberately through SQL updates.
- Auth, device, and measurement policy changes should be treated as security-sensitive.
- Refactoring should prefer small responsibility boundaries over broad abstraction.
