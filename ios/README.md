# iOS Relay App (중계 앱 설계)
## 1. Overview

VitaCore는 Apple Watch에서 수집된 생리 데이터를  
웹 플랫폼으로 전달하기 위해 iOS 중계 애플리케이션을 사용한다.

- HealthKit 데이터 접근
- 연결 코드 기반 인증
- 안전한 데이터 전송

---

## 2. Tech Stack

- Language: Swift
- IDE: Xcode
- Framework:
  - HealthKit
  - URLSession (HTTP 통신)

---

## 3. App Architecture (앱 구조)

iOS 앱은 단순 흐름 기반 구조로 설계된다.

```

[ Splash Screen ]
        ↓
[ Connection Code Input ]
        ↓
[ Connection Attempt (Loading) ]
       ↓                ↓
    Success          Failure 
       ↓                ↓
[ Data Screen ]  [ Retry Input ]

```

---

## 4. Screen Flow (화면 흐름)

### 4.1 Splash Screen

- 앱 최초 실행 화면
- 짧은 로딩 후 코드 입력 화면으로 이동

---

### 4.2 Connection Code Input Screen

- 사용자가 연결 코드를 입력
- "연결" 버튼 클릭 시 서버 검증 요청

#### 동작
- 성공 → 데이터 전송 화면 이동
- 실패 → 에러 메시지 표시 후 입력 화면 유지

---

### 4.3 Connection Loading Screen

- 서버 연결 검증 중 표시되는 로딩 화면
- 사용자 입력 차단

---

### 4.4 Data Transmission Screen

- "내 건강 정보 보내기" 버튼 제공

#### 동작
- 전송 성공
  - "정보가 전달되었습니다"
  - 마지막 전송 시간 표시

- 전송 실패
  - "정보가 전달되지 않았습니다" 표시

---

## 5. Health Data Access (HealthKit)

앱은 Apple Health 데이터를 읽기 위해 HealthKit 권한을 요청한다.

### 접근 데이터

- Heart Rate (심박수)
- ECG (심전도)
- SpO2 (산소포화도)

---

### 권한 흐름

- 앱 최초 실행 시 권한 요청 팝업 표시
- 사용자가 거부한 경우

→ "권한 설정" 버튼 클릭 시 설정 앱으로 이동

---

## 6. Data Flow (데이터 흐름)

```

Apple Watch
↓
Apple Health (iPhone)
↓
iOS Relay App
↓
VitaCore Backend API
↓
Database 저장

```

---

## 7. API Communication

- 연결 코드 검증 요청
- 바이탈 데이터 업로드 요청

### 특징

- 모든 통신은 HTTPS 기반
- 인증된 연결 코드만 데이터 전송 허용

---

## 8. Security Design (보안 설계)

- 연결 코드 기반 인증 (Connection Code)
- 만료된 코드 사용 불가
- 서버 검증 후에만 데이터 전송 가능

### Zero Trust 활용

- 모든 요청은 매번 검증
- 신뢰하지 않고 검증하는 구조 적용

---

## 9. Implementation Plan (구현 계획)

1. Xcode 프로젝트 생성
2. HealthKit 권한 설정
3. 연결 코드 입력 UI 구현
4. 서버 API 연결
5. 데이터 전송 기능 구현
6. 예외 처리 및 실패 케이스 대응
7. 실제 디바이스 테스트 (Apple Watch 연동)

---

## 10. Notes

- iOS 앱은 실제 배포가 아닌 중계용으로 사용
- Apple Watch → iPhone → Server 구조를 기반으로 동작
- 시뮬레이터에서는 HealthKit 데이터 테스트 제한 존재
