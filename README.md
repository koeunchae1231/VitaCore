# VitaCore

Security-focused vital simulation platform based on physiology and wearable data

생리학 기반 바이탈 시뮬레이션 및 웨어러블 데이터 연동 플랫폼

> Web-based physiology simulation platform with   
> wearable data relay and security-focused backend design.  

---

## Live Service

VitaCore Web Platform   
https://www.myvitacore.org/  

---

## 1. About VitaCore

VitaCore는 실측 바이탈 데이터와 시뮬레이션 데이터를 함께 활용하여
생체 신호를 시각화하는 웹 기반 프로젝트.

단순 데이터 조회 서비스가 아니라,

* physiology-based simulation
* secure backend structure
* immutable measurement history
* device verification flow

구조를 직접 설계 및 구현하는 것을 목표로 개발.

---

## 2. Motivation

생리학과 IT를 결합한 프로젝트를 직접 만들어보고 싶다는 생각에서 시작.

의료 진단 서비스보다는,

* 바이탈 데이터 흐름
* 보안 구조
* 데이터 무결성
* 시뮬레이션 기반 상태 변화

를 구현하는 교육용 플랫폼 방향으로 설계.

---

## 3. Main Features

### Authentication & Authorization

* JWT 기반 인증 구조 사용
* 이메일 인증 기반 회원가입 구현
* 보호 API 접근 시 JWT 검증 수행
* 사용자 소유 캐릭터 기반 접근 제어 구현

### Device Connection

* connection code 기반 기기 연결 구조 구현
* 1회용 코드 + 만료 시간 적용
* 등록된 기기 기반 측정값 전송 검증

### Vital Simulation

* HR, SpO2, RR, BP, MAP, TEMP 바이탈 처리
* 실측 데이터 + 시뮬레이션 데이터 분리 저장
* manual correction 이력 관리 구조 구현

### Security Logging

* 주요 이벤트를 security_events 기반으로 기록
* 로그인 실패 / 기기 거부 / 이상 탐지 로그 저장
* anomaly detection 기반 위험 상태 기록

---

## 4. Tech Stack

### Frontend

* React
* Vite
* JavaScript
* CSS

### Backend

* Node.js
* Express
* MariaDB
* JWT
* bcrypt

### iOS Relay App

* Swift
* SwiftUI
* HealthKit

---

## 4. System Flow

```text
Wearable / HealthKit
        ↓
iOS Relay App
        ↓
Express Backend API
        ↓
MariaDB
        ↓
React Web Client
```

Frontend는 DB에 직접 접근하지 않으며,

* authentication
* authorization
* simulation logic
* device validation
* measurement processing

모든 처리는 backend API 중심으로 구성.

---

## 5. Data Design

원본 측정값은 직접 수정하지 않음.

수동 수정 또는 시뮬레이션 결과 발생 시
새로운 measurement record를 생성하는 방식으로 구현.

source_type 기반으로:

* device
* simulation
* manual

데이터를 구분하여 관리.

또한 original_measurement_id를 통해
원본 데이터와 수정 데이터를 연결.

---

## 6. Security Design

VitaCore는 설명 가능한 수준의 보안 구조 구현을 목표로 개발.

구현 내용:

* bcrypt password hashing
* JWT authentication
* protected API routes
* ownership validation
* device verification
* one-time connection code
* security event logging
* lightweight anomaly detection

---

## 7. Local Commands

### Frontend Build

```bash
npm run build
```

### Backend Start

```bash
cd backend
npm start
```

환경 변수는 `backend/.env` 에서 관리.

---

## 8. Disclaimer

VitaCore는 의료 진단/치료 목적 서비스가 아님.

생리학 기반 데이터 흐름과    
보안 중심 시스템 구조를 학습 및 구현하기 위한    
educational simulation platform으로 개발.

---

## 9. Status

* Frontend implementation completed
* Backend API implementation completed
* Database design completed
* iOS relay app implementation completed
* Wearable → iOS → Backend flow implemented
* Vital monitoring system implemented
