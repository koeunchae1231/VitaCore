# VitaCore

VitaCore is a vital monitoring project using wearable data.

It is a student project. The goal is to practice full-stack app structure,
vital data flow, login, device connection, and security logs.

## About

VitaCore is a web app for checking and simulating vital signs.

It uses:

- React frontend
- Express backend
- MariaDB database
- A small iOS app for sending wearable-style data

The project handles character profiles, vital measurements, manual updates,
simulated changes, device data, and security events.

This is not a medical app. It is for learning and portfolio work.

## Features

- Sign up and sign in with JWT authentication
- Email verification for signup and account recovery
- Character profile creation and management
- Vital sign display for each character
- Manual, simulation, and device measurement records
- Measurement history saved as new records
- Device connection with connection codes
- Registered device check before accepting device data
- Security event logs for login, device, command, manual update, and anomaly events
- Basic anomaly check for out-of-range vital values

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

The frontend calls the backend API.

The frontend does not connect to the database directly. The backend handles
login, user checks, measurement processing, device checks, and security logs.

Main backend measurement files:

- `backend/src/services/measurement/measurementMapper.js`
- `backend/src/services/measurement/measurementRules.js`

Main frontend helper files:

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
- MariaDB
- `mysql2`
- JWT
- bcrypt
- Resend email API

iOS:

- Swift
- SwiftUI
- HealthKit

## Security

- Passwords are saved as bcrypt hashes.
- Private API routes use JWT bearer tokens.
- Protected routes check the logged-in user.
- Email verification codes are hashed before saving.
- Device data is checked with registered device records.
- Security logs are saved in `security_events`.
- Old security logs can be moved to `security_event_archives`.
- CORS is open in development. For production, allowed origins should be limited.

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
|-- VitaCore-iOS/
|-- docs/
|-- vitacore.sql
`-- package.json
```

## Environment Variables

Backend variables are in `backend/.env`.

```env
PORT=3000
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

Frontend variables are in `frontend/.env` when needed.

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

Do not commit local `.env` files.

## Database Setup

1. Create a MariaDB database.
2. Import `vitacore.sql`.
3. Add database settings to `backend/.env`.
4. Start the backend.
5. Check the server log.

The backend checks the security event archive table when it starts.

Some startup errors are only logged. The server may still run.

For production, the server should check required settings more carefully.

## Run Locally

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd frontend
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

Build the frontend:

```bash
cd frontend
npm run build
```

Check backend JavaScript syntax from the project root:

```powershell
Get-ChildItem -Path backend\src -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName }
```

Check whitespace in git diff:

```bash
git diff --check
```

There are no automated tests yet.

## Documentation

- [Architecture Design](./docs/architecture_design.md)
- [Modeling Design](./docs/modeling_design.md)
- [Security Notes](./docs/security.md)
- [iOS README](./VitaCore-iOS/README.md)

## Disclaimer

VitaCore is an educational simulation project.

It is not for medical diagnosis, treatment, patient monitoring, emergency
response, or clinical decisions.
