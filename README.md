# VitaCore

Security-focused vital simulation platform based on physiology and wearable data.

## Project Overview

VitaCore is a web-based vital monitoring and simulation project. It combines a React frontend, an Express backend, and a MariaDB schema to model character-based vital signs, manual corrections, simulated changes, device-submitted measurements, and security event logging.

The project is not a medical product. It is built to demonstrate application structure, data flow, authentication, audit logging, and measurement handling.

## Key Features

- JWT-based authentication with protected API routes.
- Email verification for signup and account recovery flows.
- Character profile management with vital state display.
- Vital measurement handling for manual, simulation, and device sources.
- Immutable measurement history using new records instead of overwriting source records.
- Device connection flow using connection codes and registered device identifiers.
- Security event logging for authentication, device, manual update, command, and anomaly events.
- Lightweight anomaly detection for out-of-range vital values.

## Architecture

```text
React / Vite frontend
        |
        v
Express API server
        |
        v
MariaDB database
```

The frontend does not access the database directly. Authentication, authorization, measurement processing, device validation, and security event recording are handled by the backend API.

Measurement-specific mapping and rules are split into focused backend helper modules:

- `backend/src/services/measurement/measurementMapper.js`
- `backend/src/services/measurement/measurementRules.js`

Character event and command display helpers are split into focused frontend utility modules:

- `frontend/src/utils/securityEventDisplay.js`
- `frontend/src/utils/characterCommands.js`

## Tech Stack

Frontend:

- React
- Vite
- JavaScript
- CSS

Backend:

- Node.js
- Express
- MariaDB-compatible SQL schema
- `mysql2`
- JWT
- bcrypt
- Resend email API

## Security Highlights

- Passwords are stored as bcrypt hashes.
- API authentication uses JWT bearer tokens.
- Protected routes validate the authenticated user before handling private data.
- Email verification codes are hashed before storage.
- Device-submitted measurements are checked against registered device records.
- Important security and audit events are written to `security_events`.
- Older security events can be archived into `security_event_archives`.
- Development CORS is currently open; production deployments should restrict allowed origins.

## Project Structure

```text
.
|-- backend/
|   |-- src/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- middlewares/
|   |   |-- routes/
|   |   |-- services/
|   |   |   `-- measurement/
|   |   |-- templates/
|   |   |-- utils/
|   |   `-- validators/
|   `-- package.json
|-- frontend/
|   |-- src/
|   |   |-- api/
|   |   |-- assets/
|   |   |-- components/
|   |   |-- pages/
|   |   `-- utils/
|   `-- package.json
|-- docs/
|-- vitacore.sql
`-- package.json
```

## Environment Variables

Backend variables are read from `backend/.env`.

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=vitacore

JWT_SECRET=replace_with_a_strong_secret

RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=VitaCore <noreply@example.com>
EMAIL_USER=optional_sender_address
```

Frontend variables are read from `frontend/.env` when needed.

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Keep local `.env` files out of version control.

## Database Setup

1. Create a MariaDB database for VitaCore.
2. Import the schema from `vitacore.sql`.
3. Configure the backend database variables in `backend/.env`.
4. Start the backend and confirm that the database connection log appears.

The server currently logs database connection test failures during startup instead of always stopping the process. The security event archive table check is also logged if it fails. Production deployments should add stricter environment validation and log monitoring around these startup checks.

## Run Locally

Install dependencies:

```bash
cd backend
npm install

cd ../frontend
npm install
```

Start the backend:

```bash
cd backend
npm start
```

Start the frontend:

```bash
cd frontend
npm run dev
```

## Build / Verify

Frontend build:

```bash
cd frontend
npm run build
```

Backend JavaScript syntax check from the repository root:

```powershell
Get-ChildItem -Path backend\src -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName }
```

Diff whitespace check:

```bash
git diff --check
```

There is no dedicated automated test suite in the current project.

## Documentation

- [Architecture Design](./docs/architecture_design.md)
- [Modeling Design](./docs/modeling_design.md)
- [Security Notes](./docs/security.md)

## Disclaimer

VitaCore is an educational simulation project. It is not intended for medical diagnosis, treatment, patient monitoring, emergency response, or clinical decision-making.
