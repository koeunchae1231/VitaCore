# VitaCore Modeling Design

VitaCore의 데이터 모델링 구조와 설계 원칙을 정리한 문서.

본 문서는 구현 코드나 보안 정책보다는,

* domain modeling
* database structure
* immutable data design
* relationship modeling
* backend-centered data processing structure

중심으로 작성.

---

# 1. Modeling Goals

VitaCore는 다음 목표를 기반으로 데이터 구조를 설계.

* 실측 데이터와 시뮬레이션 데이터 통합 관리
* 데이터 변경 이력 추적 가능 구조 유지
* 사용자 / 기기 / 측정 데이터 역할 분리
* Backend 중심 데이터 처리 구조 유지
* 확장 가능한 바이탈 데이터 구조 확보

---

# 2. Core Domain Modeling

## Main Domain

| Domain          | Description   |
| --------------- | ------------- |
| User            | 시스템 사용자       |
| Character       | 사용자별 시뮬레이션 대상 |
| AppDevice       | 등록된 모바일 기기    |
| ConnectionCode  | 기기 연결용 인증 코드  |
| Measurement     | 바이탈 데이터       |
| WaveMeasurement | ECG 기반 파형 데이터 |
| VitalType       | 바이탈 종류 정의     |

---

## Domain Relationship

```
User 1 : N Character
Character 1 : N Measurement
Character 1 : N AppDevice
Measurement 1 : N WaveMeasurement
VitalType 1 : N Measurement
```

---

# 3. Measurement Modeling

## Immutable Measurement Structure

VitaCore는 measurement 데이터를 overwrite하지 않는 구조로 설계.

수정 또는 시뮬레이션 결과 발생 시:

* 기존 row 수정 금지
* 새로운 measurement row 생성

방식을 사용.

---

## Source Type Separation

측정 데이터는 source_type 기반으로 구분.

```
device
simulation
manual
```

이를 통해:

* 실측 데이터
* 시뮬레이션 데이터
* 사용자 수정 데이터

를 분리하여 관리하도록 설계.

---

## Original Measurement Relationship

manual correction 발생 시,

수정 데이터는 original_measurement_id를 통해 원본 데이터와 연결.

```
original_measurement_id
```

이를 통해:

* 데이터 변경 이력 추적
* 원본 데이터 보존
* 수정 흐름 연결

구조를 유지.

---

# 4. Wave Data Separation

ECG와 같은 파형 데이터는 일반 measurement 데이터와 분리하여 저장.

wave_measurements 테이블은:

* measurement_id
* waveform JSON data

기반으로 구성.

이를 통해:

* 수치형 바이탈 데이터
* 대용량 파형 데이터

를 분리하여 관리하도록 설계.

---

# 5. Vital Type Normalization

HR, SpO2 등의 바이탈 종류는
vital_types 테이블로 분리하여 관리.

이를 통해:

* 바이탈 종류 확장 가능성 확보
* 하드코딩 최소화
* 데이터 일관성 유지

구조를 적용.

---

# 6. Database Physical Design

## users

| Column        | Type                | Description |
| ------------- | ------------------- | ----------- |
| id            | BIGINT PK           | 사용자 ID      |
| email         | VARCHAR(255) UNIQUE | 이메일         |
| password_hash | VARCHAR(255)        | 비밀번호 해시     |
| created_at    | DATETIME            | 생성 시간       |

---

## characters

| Column  | Type         | Description |
| ------- | ------------ | ----------- |
| id      | BIGINT PK    | 캐릭터 ID      |
| user_id | BIGINT FK    | 사용자         |
| name    | VARCHAR(100) | 캐릭터 이름      |
| age     | INT          | 나이          |
| gender  | VARCHAR(20)  | 성별          |

---

## app_devices

| Column            | Type                | Description |
| ----------------- | ------------------- | ----------- |
| id                | BIGINT PK           | 기기 ID       |
| character_id      | BIGINT FK           | 연결 캐릭터      |
| device_identifier | VARCHAR(255) UNIQUE | 기기 식별값      |
| device_name       | VARCHAR(100)        | 기기 이름       |

---

## measurements

| Column                  | Type      | Description |
| ----------------------- | --------- | ----------- |
| id                      | BIGINT PK | 측정 ID       |
| character_id            | BIGINT FK | 캐릭터         |
| vital_type_id           | BIGINT FK | 바이탈 타입      |
| app_device_id           | BIGINT FK | 측정 기기       |
| original_measurement_id | BIGINT FK | 원본 데이터 연결   |
| value                   | FLOAT     | 측정값         |
| measured_at             | DATETIME  | 측정 시간       |
| source_type             | ENUM      | 데이터 출처      |

---

## wave_measurements

| Column         | Type      | Description |
| -------------- | --------- | ----------- |
| id             | BIGINT PK | 파형 ID       |
| measurement_id | BIGINT FK | 측정 데이터      |
| data           | LONGTEXT  | 파형 JSON     |

---

# 7. Backend-centered Data Structure

Frontend는 Database에 직접 접근하지 않음.

모든 데이터 처리는 Backend API를 통해 수행.

```
Frontend
    ↓
Backend API
    ↓
Database
```

이를 통해:

* centralized validation
* relationship consistency
* unified data processing

구조를 유지하도록 설계.

---

# 8. Modeling Rules

## Identifier Rules

* 모든 PK/FK는 BIGINT 사용
* FK와 PK 타입 일치 유지

---

## Naming Convention

### Table Naming

* snake_case 사용
* 복수형 테이블명 사용

예시:

```
users
characters
measurements
wave_measurements
```

---

### Timestamp Naming

시간 컬럼은 `_at` 형식 사용.

예시:

```
created_at
updated_at
measured_at
expires_at
```

---

# 9. Modeling Philosophy

VitaCore는 단순 CRUD 구조보다는,

* immutable data handling
* explicit relationship modeling
* measurement history preservation
* backend-centered processing

구조를 유지하는 방향으로 모델링 및 설계를 진행.
