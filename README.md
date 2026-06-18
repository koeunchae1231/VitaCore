# VitaCore

VitaCore is a vital monitoring project using wearable data.

풀스택 웹 애플리케이션 개발을 목표로     
사용자 인증, 바이탈 데이터 관리, 디바이스 연동, 보안 기능을 직접 구현한    
교육 및 포트폴리오 프로젝트     

## About

VitaCore is a web app for checking and simulating vital signs.

It uses:

- React frontend
- Express backend
- MariaDB database
- A small iOS app for sending wearable-style data

사용자별 캐릭터 관리, 바이탈 측정 데이터 저장, 수동 수정,         
시뮬레이션 데이터 관리, 디바이스 연동, 보안 이벤트 기록 등의 기능을 구현         

This is not a medical app. It is for learning and portfolio work.

## Features

* React, Express, MariaDB 기반 바이탈 모니터링 풀스택 웹 애플리케이션 개발
* 사용자, 캐릭터, 디바이스, 측정값, 보안 이벤트 간 관계를 고려하여 정규화 및 관계 제약 조건을 적용한 MariaDB 10개 테이블 설계
* Express Router 7개와 API 35개를 Controller, Service, Validator, Middleware 계층으로 분리하여 구현
* JWT 기반 사용자 인증·인가, bcrypt 비밀번호 해시, 이메일 인증 코드 해시 저장 구조 구현
* Connection Code 기반 iOS 디바이스 등록, Device JWT 기반 디바이스 인증, HealthKit HR·SpO₂ 데이터 전송 파이프라인 구현
* User JWT와 Device JWT 인증 경로를 분리하여 측정 데이터 출처에 따른 저장 권한을 서버에서 검증하는 구조 구현
* Batch API를 활용한 오프라인 측정 데이터 동기화 기능 구현
* 유효 범위를 벗어난 바이탈 데이터를 탐지하여 `security_events` 테이블에 기록하는 이상치 탐지 구조 설계
* `security_events` 및 `security_event_archives` 테이블을 활용한 감사 로그 기록 및 아카이빙 구조 설계
* HealthKit HR·SpO₂ 데이터를 기반으로 RR을 계산하고 바이탈 데이터 처리 과정 자동화

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

> 프론트엔드는 데이터베이스에 직접 접근하지 않고 REST API를 통해 백엔드와 통신
>  
> 백엔드는 사용자 인증 및 권한 검증, 측정 데이터 처리, 디바이스 인증, 보안 이벤트 기록 등 핵심 비즈니스 로직을 담당      
> 모든 데이터베이스 접근은 백엔드를 통해 수행


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

* 사용자 비밀번호는 bcrypt 해시 방식으로 저장
* 인증이 필요한 API는 JWT Bearer Token 기반으로 접근 제어
* 보호된 API는 로그인한 사용자의 권한을 검증한 후 요청 처리
* 이메일 인증 코드는 해시 처리 후 데이터베이스에 저장
* 등록된 디바이스인지 검증한 후에만 측정 데이터 저장
* 로그인, 디바이스 연결, 명령 실행, 이상치 탐지 등의 보안 이벤트를 `security_events` 테이블에 기록
* 오래된 보안 이벤트는 `security_event_archives` 테이블로 아카이빙 가능
* 개발 환경에서는 CORS를 허용하며, 운영 환경에서는 허용 Origin을 제한하도록 설계

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

백엔드 서버는 시작 시 security_event_archives 테이블의 존재 여부를 확인    
일부 초기화 오류는 로그로만 기록되며, 오류 종류에 따라 서버는 계속 실행될 수 있음     
운영 환경에서는 필수 환경 변수와 데이터베이스 설정을 검증한 후 서비스를 실행하는 것을 권장     

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

* /api/measurements API가 인증 없이 데이터를 받아 스푸핑 공격 가능성 존재

#### Cause

* Connection Code를 기기 식별 용도로만 사용했고, 실제 인증(Authentication) 경계가 없었음

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

* 네트워크 단절 시 측정 데이터 유실

#### Cause

* 최신 HealthKit 데이터 1건만 즉시 전송하는 구조였음

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

* 이상치 탐지 임계값이 코드에 하드코딩

#### Cause

* 초기 MVP 구현 단계에서 단순 Switch 기반으로 작성

#### Solution

* Rule Config로 분리
* 향후 DB 기반 Rule Engine으로 확장 가능한 구조로 변경

#### Result

* 유지보수 향상
* 환자별 Rule 확장 가능
* 재배포 없이 규칙 변경 가능한 방향 확보

---

### Device Authentication Flow

1. 웹 애플리케이션에서 캐릭터별 Connection Code를 생성
2. iOS 애플리케이션이 디바이스 식별자와 디바이스 이름을 함께 전송하여 Connection Code를 검증
3. 백엔드는 디바이스를 등록(또는 재등록)한 후 Device JWT를 발급
4. iOS 애플리케이션은 발급받은 Device JWT를 Keychain에 안전하게 저장
5. /api/measurements와 /api/measurements/batch API는 Authorization: Bearer <deviceToken>을 통해 Device JWT를 검증한 후 측정 데이터를 저장
6. 사용자의 수동 수정 기능은 기존 User JWT 인증 체계를 사용하여 처리

### 4. Device Token Revocation

#### Problem

* Device JWT는 만료 시간 전까지 항상 유효하여, 서버에서 즉시 무효화할 수 없었음

#### Cause

* 미들웨어가 JWT의 서명과 클레임만 검증하고, 데이터베이스에 저장된 디바이스의 현재 상태를 확인하지 않았음

#### Solution

* app_devices 테이블에 is_revoked, revoked_at, last_seen_at, current_token_jti 컬럼을 추가
* Device JWT에 jti 값을 추가하여 토큰을 식별할 수 있도록 변경
* 디바이스 인증 시 JWT 검증 후 데이터베이스에서 디바이스 정보를 조회하고, 토큰 폐기 여부와 current_token_jti 일치 여부를 함께 검증하도록 개선
* 디바이스를 재등록하면 current_token_jti를 갱신하여 기존 Device JWT가 더 이상 인증되지 않도록 구현
* 사용자가 디바이스를 비활성화하고 토큰을 폐기할 수 있는 API를 추가

#### Result

* JWT 만료 이전에도 서버에서 Device JWT를 즉시 무효화할 수 있음
* 디바이스 재등록 시 새로운 Device JWT만 사용할 수 있으며, 기존 토큰은 자동으로 차단
* 폐기되었거나 등록되지 않은 디바이스의 측정 데이터 저장을 서버에서 차단

---

### 5. Polling Race Condition

#### Problem

* 이전 Polling 요청이 완료되기 전에 새로운 요청이 실행되어 중복 요청이 발생할 수 있었음

#### Cause

* Polling 중인 요청의 실행 상태를 관리하지 않았으며, 컴포넌트가 종료될 때 진행 중인 요청도 취소되지 않았음

#### Solution

* AbortController를 활용하여 Polling 요청을 제어하도록 개선
* 이전 요청이 완료되지 않은 경우 새로운 Polling 요청을 실행하지 않도록 구현
* 컴포넌트 종료 시 Polling 타이머를 해제하고 진행 중인 요청을 함께 취소하도록 변경
* 취소되었거나 오래된 응답은 UI를 갱신하지 않도록 처리

#### Result

* 중복 Polling 요청이 발생하지 않음
* 컴포넌트 종료 시 불필요한 요청이 안전하게 정리
* 느린 응답이 최신 UI 상태를 덮어쓰는 문제를 방지

---

### Offline Sync / Batch Measurement Flow

1. iOS 애플리케이션은 lastSyncedAt 값을 UserDefaults에 저장
2. 데이터 전송 시 lastSyncedAt 이후의 HealthKit 측정 데이터를 수집
3. 수집한 데이터를 POST /api/measurements/batch API로 전송
4. 백엔드는 Device JWT를 검증한 후 각 측정 데이터를 처리
5. 디바이스, 바이탈 종류, 측정 시각을 기준으로 중복 데이터를 확인
6. Batch 전송이 성공한 경우에만 lastSyncedAt을 갱신하여 실패한 데이터는 재전송 가능

### Measurement Rule Configuration

Measurement anomaly thresholds are defined in:

```text
backend/src/services/measurement/measurementRuleConfig.js
```

detectMeasurementAnomaly(vitalCode, value, profile) 함수는 Rule Config를 기반으로 이상치를 탐지하며,     
profile 인자를 통해 향후 연령, 성별, 캐릭터별 규칙을 적용할 수 있도록 확장성을 고려하여 설계함    

### Security Improvements

* 디바이스에서 전송되는 측정 데이터는 Device JWT 기반으로 인증하도록 구현
* 사용자의 수동 수정 기능은 기존 User JWT 인증 체계를 유지하여 인증 경계를 분리
* Device Identifier와 Connection Code를 측정 데이터 인증 수단으로 사용하지 않도록 개선
* Batch Measurement API 역시 단건 측정 API와 동일한 Device JWT 인증 체계를 적용

### Test 실행 방법

```bash
cd backend
npm test
```

```bash
cd frontend
npm test
```

백엔드 테스트에서는 Device JWT 누락 요청 차단, 정상 Device JWT 인증, 폐기된 Device JWT 차단, Batch API 인증, 설정 기반 이상치 탐지 동작을 검증

프론트엔드 테스트에서는 Polling 중복 요청 방지와 AbortController를 이용한 요청 취소 및 컴포넌트 정리 동작을 검증

> VitaCore 프로젝트는 코드 리뷰, 아키텍처 리뷰, GitHub 포트폴리오 피드백을 반영하여 지속적으로 개선       
> 기능 구현에 그치지 않고 보안성, 안정성, 유지보수성을 향상시키는 방향으로 구조를 지속적으로 개선

## Disclaimer

VitaCore is an educational simulation project.

It is not for medical diagnosis, treatment, patient monitoring, emergency
response, or clinical decisions.
