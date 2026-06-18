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

Run backend tests:

```bash
cd backend
npm test
```

## Documentation

- [Architecture Design](./docs/architecture_design.md)
- [Modeling Design](./docs/modeling_design.md)
- [Security Notes](./docs/security.md)
- [iOS README](./VitaCore-iOS/README.md)

## Troubleshooting & Improvements

### 1. Device Authentication

#### Problem

* /api/measurements API가 인증 없이 데이터를 받아 스푸핑 공격 가능성이 존재했습니다.

#### Cause

* Connection Code를 기기 식별 용도로만 사용했고, 실제 인증(Authentication) 경계가 없었습니다.

#### Solution

* Connection Code 인증 이후 Device JWT를 발급하도록 변경
* iOS는 Keychain에 Device JWT 저장
* 모든 측정 데이터 전송은 Authorization Bearer Token을 통해 인증
* 서버는 Device JWT 검증 후에만 저장

#### Result

* 인증과 식별을 분리
* 임의 데이터 조작 위험 감소
* Secure by Design 원칙 강화

---

### 2. Offline Synchronization

#### Problem

* 네트워크 단절 시 측정 데이터가 유실되었습니다.

#### Cause

* 최신 HealthKit 데이터 1건만 즉시 전송하는 구조였습니다.

#### Solution

* lastSyncedAt 기반 Cursor Sync 도입
* Batch Measurement API 추가
* 재전송 및 중복 방지 로직 적용

#### Result

* 오프라인 데이터 보존
* 안정적인 대량 동기화
* 헬스케어 서비스 신뢰성 향상

---

### 3. Measurement Rule Refactoring

#### Problem

* 이상치 탐지 임계값이 코드에 하드코딩되어 있었습니다.

#### Cause

* 초기 MVP 구현 단계에서 단순 Switch 기반으로 작성했습니다.

#### Solution

* Rule Config로 분리
* 향후 DB 기반 Rule Engine으로 확장 가능한 구조로 변경

#### Result

* 유지보수 향상
* 환자별 Rule 확장 가능
* 재배포 없이 규칙 변경 가능한 방향 확보

---

### Device Authentication Flow

1. The web app creates a short-lived connection code for a character.
2. The iOS app verifies the connection code with its device identifier and device name.
3. The backend registers or reactivates the device and returns a Device JWT.
4. The iOS app stores the Device JWT in Keychain.
5. `/api/measurements` and `/api/measurements/batch` require `Authorization: Bearer <deviceToken>`.
6. Manual correction keeps the existing user JWT flow.

### 4. Device Token Revocation

#### Problem

* Device JWTs were valid until expiration and could not be invalidated immediately on the server.

#### Cause

* The middleware only verified JWT signature and claims, without checking the current device state in the database.

#### Solution

* Added `is_revoked`, `revoked_at`, `last_seen_at`, and `current_token_jti` fields to `app_devices`.
* Added `jti` to Device JWTs.
* Device auth now verifies the JWT, loads the device from the database, checks revocation state, and compares the token `jti` with the current device token id.
* Re-registration rotates `current_token_jti`, so older Device JWTs no longer pass middleware checks.
* Added a user-authenticated device revoke endpoint that marks the device inactive and revoked.

#### Result

* Server-side token invalidation is possible before JWT expiration.
* Re-registered devices receive a fresh token while older tokens are rejected.
* Measurement writes are blocked for revoked or unregistered devices.

---

### 5. Polling Race Condition

#### Problem

* Vital polling could start a new request before a previous polling request finished.

#### Cause

* The polling interval did not track in-flight requests or cancel work during component cleanup.

#### Solution

* Added a polling request gate that uses `AbortController`.
* Polling skips new requests while a previous request is still running.
* Component cleanup clears the polling interval and aborts the active request.
* Aborted or stale responses are ignored before updating UI state.

#### Result

* Duplicate polling requests are prevented.
* Unmount cleanup is safer.
* Slow polling responses are less likely to overwrite newer UI state.

---

### Device Token Revocation Flow

1. Connection code verification creates a Device JWT with a `jti`.
2. The backend stores the current token id in `app_devices.current_token_jti`.
3. Device measurement middleware verifies the JWT signature and then loads the device row.
4. The request is rejected if the device is missing, inactive, revoked, or if the JWT `jti` does not match `current_token_jti`.
5. Re-registration rotates `current_token_jti`, invalidating older tokens for that device.
6. Device revocation marks `is_revoked = TRUE`, sets `revoked_at`, clears `current_token_jti`, and blocks future measurement writes.

### Offline Sync / Batch Measurement Flow

1. The iOS app stores `lastSyncedAt` in `UserDefaults`.
2. On transfer, HealthKit samples after `lastSyncedAt` are collected.
3. The app sends those samples to `POST /api/measurements/batch`.
4. The backend validates the Device JWT and processes each measurement.
5. Duplicate device measurements are checked by device, vital type, and measurement timestamp.
6. The app updates `lastSyncedAt` only after a successful batch response, so failed transfers can be retried.

### Measurement Rule Configuration

Measurement anomaly thresholds are defined in:

```text
backend/src/services/measurement/measurementRuleConfig.js
```

`detectMeasurementAnomaly(vitalCode, value, profile)` keeps the existing call pattern and reads from the rule config. The optional profile argument leaves room for age, gender, or character-specific rule selection later.

### Security Improvements

* Device JWT authentication was added for device-originated measurement writes.
* User JWT authentication remains separate for user actions such as manual correction.
* Device identifier and connection code are no longer treated as measurement authentication credentials.
* Batch writes reuse the same Device JWT boundary as single measurement writes.

### Test 실행 방법

```bash
cd backend
npm test
```

```bash
cd frontend
npm test
```

The backend test suite checks missing device token rejection, valid device token acceptance, revoked device token rejection, batch endpoint authentication, and config-based anomaly detection.

The frontend test suite checks polling duplicate prevention and AbortController cleanup behavior.

> This repository has been continuously improved based on code reviews, architecture reviews, and GitHub portfolio feedback. Each improvement focuses on strengthening security, reliability, and maintainability while keeping the original architecture intact.

## Disclaimer

VitaCore is an educational simulation project.

It is not for medical diagnosis, treatment, patient monitoring, emergency
response, or clinical decisions.
