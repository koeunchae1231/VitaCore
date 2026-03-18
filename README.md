# VitaCore

Security-focused web platform for physiology-based vital simulation and visualization

---

## Overview

VitaCore는 웨어러블 바이탈 데이터를 기반으로 생리학적 시뮬레이션을 수행하고,

이를 시각화하는 보안 중심(Web-based) 플랫폼이다.

본 시스템은 단순 데이터 수집이 아닌,

- 실측 데이터 + 시뮬레이션 데이터 통합 처리
- 데이터 변경 이력 추적 (Immutable Data Design)
- Zero Trust 개념 참고 검증 구조
- 의료 데이터 특성을 고려한 보안 설계

를 핵심 목표로 설계되었다.

### Disclaimer

VitaCore는 의료 진단 또는 치료를 위한 시스템이 아니며,  
생리학 학습 및 시뮬레이션 목적의 플랫폼으로 설계되었다.

---

## 1. System Architecture (시스템 구조)

VitaCore는 보안성과 확장성을 고려하여 3계층 구조로 설계되었다.

- Frontend (React)
- Backend (Node.js + Express)
- Database (MariaDB)

### 1.1 System Flow Diagram (자료 흐름도)

### 1.2 ERD (엔터티 관계도)

### Design Principle

- 모든 데이터는 Backend API를 통해서만 접근
- 클라이언트에서 DB 직접 접근 차단
- 인증 및 권한 검증은 서버에서 일원화

→ Zero Trust 개념 참고 검증 적용

---

## 2. Core Domain (핵심 도메인)

각 도메인은 다음 역할을 가진다:

- User  
  → 시스템 사용자 계정

- Character  
  → 사용자별 생리 시뮬레이션 대상

- AppDevice  
  → 연결된 모바일 또는 웨어러블 기기

- ConnectionCode  
  → 기기 연결을 위한 1회성 인증 코드

- Measurement  
  → 수치형 바이탈 데이터 (HR, SpO2 등)

- WaveMeasurement  
  → 파형 데이터 (ECG 등)

- VitalType  
  → 바이탈 종류 정의 (확장 가능 구조)

- SecurityEvent  
  → 인증 및 접근 관련 보안 로그
  
---

## 3. Database Physical Design (DB 물리 설계)
### Design Philosophy

VitaCore의 데이터 구조는 다음 원칙을 따른다.

1. **Immutable Data**
   - 기존 원본 데이터는 직접 수정하지 않는다.

2. **Traceability**
   - 변경 이력과 데이터 출처를 추적할 수 있어야 한다.

3. **Source Separation**
   - 실측값, 시뮬레이션값, 수동 수정값을 구분한다.

4. **Extensibility**
   - 바이탈 항목과 보안 구조를 확장 가능하게 설계한다.
  
### 3.1 users

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGINT PK | 사용자 ID |
| email | VARCHAR(255) UNIQUE | 이메일 |
| password_hash | VARCHAR(255) | bcrypt 해시 |
| created_at | DATETIME | 생성 시간 |
| updated_at | DATETIME | 수정 시간 |
| last_login_at | DATETIME | 마지막 로그인 |
| is_active | BOOLEAN | 활성 여부 |

### 3.2 characters

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGINT PK | 캐릭터 ID |
| user_id | BIGINT FK | 사용자 |
| name | VARCHAR(100) | 캐릭터 이름 |
| created_at | DATETIME | 생성 시간 |

### 3.3 app_devices

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGINT PK | 기기 ID |
| user_id | BIGINT FK | 사용자 |
| device_identifier | VARCHAR(255) UNIQUE | 기기 고유값 |
| created_at | DATETIME | 생성 시간 |
| updated_at | DATETIME | 수정 시간 |
| last_login_at | DATETIME | 마지막 접속 |
| is_active | BOOLEAN | 활성 여부 |

### 3.4 connection_codes

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGINT PK | 코드 ID |
| user_id | BIGINT FK | 사용자 |
| code | VARCHAR(20) UNIQUE | 연결 코드 |
| created_at | DATETIME | 생성 시간 |
| expires_at | DATETIME | 만료 시간 |
| used_at | DATETIME | 사용 시간 |
| is_used | BOOLEAN | 사용 여부 |

### 3.5 vital_types

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | INT PK | 타입 ID |
| name | VARCHAR(50) | 바이탈 종류 (HR, SpO2 등) |

### 3.6 measurements

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGINT PK | 측정 ID |
| character_id | BIGINT FK | 캐릭터 |
| vital_type_id | BIGINT FK | 바이탈 타입 |
| original_measurement_id | BIGINT FK | 원본 = NULL / 수정본 = 원본의 id |
| value | FLOAT | 측정 값 |
| measured_at | DATETIME | 측정 시간 |
| source_type | ENUM('device','simulation','manual') | 데이터 출처 구분 |

> source_type: 실측(device), 시뮬레이션(simulation), 수동 수정(manual)을 구분하기 위해 사용한다.

> Simulation 데이터는 Backend의 physiology simulation module에서 생성되며,
>
> 저장 시 source_type = 'simulation'으로 기록된다.

> 인증된 사용자 본인이 소유한 캐릭터의 데이터에 한해 manual 입력 가능하다.
>
> 정정 여부는 original_measurement_id 존재 여부로 판단한다.

### 3.7 wave_measurements

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGINT PK | 파형 ID |
| measurement_id | BIGINT FK | 측정 ID |
| type | VARCHAR(50) | 파형 종류 (ECG 등) |
| data | TEXT | 파형 JSON |
| measured_at | DATETIME | 측정 시간 |

> measurements에서 파생된 표현 데이터로,
>
> measurements의 값을 파형으로 시각화하기에 임의 변경이 불가능하다.

### 3.8 security_events

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGINT PK | 이벤트 ID |
| user_id | BIGINT FK | 사용자 |
| type | VARCHAR(100) | 이벤트 종류 |
| description | TEXT | 상세 내용 |
| created_at | DATETIME | 생성 시간 |

---

## 4. Authentication Flow (인증 흐름)

1. 사용자 로그인 (email + password)
2. 서버에서 bcrypt 검증
3. JWT 발급
4. 모든 요청은 JWT 기반 인증

### Zero Trust 개념 활용

- 모든 요청은 인증 필요 (stateless)
- 토큰 만료 정책 적용
- 새로운 기기 접속 시 추가 검증

→ Zero Trust 개념 참고 검증 적용

---

## 5. Device Connection Flow (기기 연결 흐름)

1. 웹에서 연결 코드 생성
2. 모바일 앱에서 코드 입력
3. 서버에서 코드 검증
4. 기기 등록 후 활성화
5. 이후 바이탈 데이터 전송 가능

### Security Point

- 연결 코드는 1회성 + 만료 시간 존재
- 사용자 + 코드 + 기기 조합 검증
- 승인된 기기만 데이터 전송 가능
  
---

## 6. Security Design (보안 설계)
### 6.1 Basic Security

- 비밀번호 bcrypt 해시 저장
- JWT 기반 인증 + 만료 정책
- HTTPS 통신 적용
- 인증 없는 API 접근 차단

### 6.2 Access Control

- Zero Trust 기반 인증 구조
- 기기 기반 접근 제어 (AppDevice)
- 장기 미접속 기기 자동 비활성화

### 6.3 Connection Security

- 연결 코드 1회성 사용
- 데이터 출처 구분 (위조 방지 기반)

### 6.4 Logging and Audit

- 모든 주요 이벤트 기록 (SecurityEvent)
- 로그인 / 실패 / 기기 등록 추적

### 6.5 Planned Security Expansion

- 경량 AI 기반 이상 탐지
- CSAP 참고 보안 정책 적용

---

## 7. Data Integrity (데이터 무결성)

- 원본 데이터는 수정하지 않음
- 수정 시 새로운 레코드 생성
- 데이터 출처(source_type)로 구분

→ 데이터 위변조 방지 및 이력 추적 가능

---

## 8. REST API Design (API 설계)
> 인증이 필요한 요청은 JWT를 Authorization Header에 포함하여 전송한다.
### 8.1 Auth API
#### 8.1.1 POST /api/auth/signup

**Request**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response**
```json
{
  "message": "Signup success",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

#### 8.1.2 POST /api/auth/login
= JWT 발급

**Request**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response**
```json
{
  "token": "jwt-token",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```
> 보호된 API 요청 시 해당 토큰을 Authorization Header에 포함한다.

### 8.2 Character API
#### 8.2.1 GET /api/characters
= 캐릭터 목록 조회
#### 8.2.2 POST /api/characters
= 캐릭터 생성

**Request**
```json
{
  "name": "Patient A"
}
```
**Response**
```json
{
  "id": 1,
  "name": "Patient A",
  "user_id": 1,
  "created_at": "2026-03-18T12:00:00"
}
```

### 8.3 Device API
#### 8.3.1 POST /api/devices/connection-code
= 연결 코드 생성

**Response**
```json
{
  "code": "ABCD1234",
  "expires_at": "2026-03-18T12:00:00"
}
```

#### 8.3.2 POST /api/devices/register
= 모바일 앱에서 연결 코드 입력 후 기기 등록

**Request**
```json
{
  "code": "ABCD1234",
  "device_identifier": "mobile-device-001"
}
```
**Response**
```json
{
  "message": "Device registered successfully"
}
```

### 8.4 Measurement API
#### 8.4.1 POST /api/measurements
= 수치형 바이탈 데이터 저장

**Request**
```json
{
  "character_id": 1,
  "vital_type_id": 1,
  "value": 78.5,
  "measured_at": "2026-03-18T12:30:00",
  "source_type": "device"
}
```
**Response**
```json
{
  "message": "Measurement saved successfully"
}
```

#### 8.4.2 GET /api/characters/:characterId/measurements
= 캐릭터별 바이탈 측정값 조회

**Response**
```json
[
  {
    "id": 1,
    "character_id": 1,
    "vital_type_id": 1,
    "value": 78.5,
    "measured_at": "2026-03-18T12:30:00",
    "source_type": "device"
  }
]
```

### 8.5 Wave API
#### 8.5.1 POST /api/waves
= 파형 데이터 저장

**Request**
```json
{
  "character_id": 1,
  "type": "ECG",
  "data": "[0.12,0.15,0.18,0.16]",
  "measured_at": "2026-03-18T12:30:00"
}
```
**Response**
```json
{
  "message": "Wave data saved successfully"
}
```

### 8.6 Security Event API
#### 8.6.1 GET /api/security-events
= 보안 이벤트 조회  
> 인증된 사용자는 본인 계정과 관련된 보안 이벤트만 조회 가능하다.


**Response**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "type": "LOGIN_SUCCESS",
    "description": "User login completed successfully",
    "created_at": "2026-03-18T12:31:00"
  }
]
```

---

## 9. Implementation Rules (구현 규칙)

- 모든 DB 접근은 Backend에서만 수행
- FK 무결성 유지 필수
- 인증 없는 API 접근 금지
- 모든 주요 행동은 로그 기록

---
## 10. Naming Convention (명명 규칙)
### Table Naming
- 모든 테이블은 소문자(snake_case)를 사용
- 테이블명은 복수형으로 정의

### Identifier (ID)
- 모든 식별자(id, *_id)는 BIGINT 타입을 사용
- PK와 FK는 동일한 타입으로 유지

### Timestamp
- 시간 컬럼은 _at 형식을 사용

