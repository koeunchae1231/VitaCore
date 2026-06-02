# VitaCore

VitaCore is a full-stack patient vital simulation and monitoring app.

## Current Implementation

- React/Vite frontend with character, connection, vital monitor, and help screens.
- Express backend with JWT auth, character management, device connection codes, measurements, and security event APIs.
- iOS/device measurements update latest vitals while keeping EVENT and ALARM flows separate.
- DEFAULT and manual vital edits are persisted as simulation/manual measurements.
- Latest vitals sync includes HR, SpO2, RR, BP, MAP, and TEMP display data.
- RR is derived from SpO2 when device SpO2 data is received.
- Device TEMP and raw device RR are ignored according to the current policy, with security events recorded.

## Project Structure

- `backend/`: Express API server and MariaDB access.
- `frontend/`: Vite React client.
- `docs/`: security and implementation notes.

## Local Commands

```bash
npm run build
```

The root build command runs the frontend production build.

```bash
cd backend
npm start
```

Starts the backend API server. Configure database and secrets in `backend/.env`.

## Git Hygiene

Generated or local-only files are ignored by `.gitignore`, including `.env`, `node_modules`, and `frontend/dist`.
