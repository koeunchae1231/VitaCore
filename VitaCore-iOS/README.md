# VitaCore iOS Relay App

## 1. Overview

VitaCore iOS 앱은 Apple Health 기반 생체 데이터를    
VitaCore 웹 플랫폼으로 전달하기 위한 Relay Application 구조로 설계.

HealthKit 기반 데이터 접근,     
연결 코드 기반 기기 인증,     
Backend API 기반 데이터 전송 기능을 중심으로 구성.

---

## 2. Tech Stack

- Language
  - Swift

- IDE
  - Xcode

- Framework
  - SwiftUI
  - HealthKit
  - URLSession

 ---

 ## 3. App Architecture

iOS 앱은 연결 코드 기반 기기 인증과    
HealthKit 데이터 전송 흐름 중심으로 구성.

```
[ Splash Screen ]
        ↓
[ Connection Code Input ]
        ↓
[ Connection Loading ]
       ↓                ↓
    Success          Failure
       ↓                ↓
[ Data Transfer ]  [ Retry Input ]
```

---

## 4. Screen Flow

### Splash Screen

앱 최초 실행 화면.  

짧은 로딩 후 연결 코드 입력 화면으로 이동.

---

### Connection Code Input Screen

사용자가 연결 코드를 입력하고 서버 검증 요청을 수행.

- 성공
  - 데이터 전송 화면 이동

- 실패
  - 에러 메시지 표시 후 입력 화면 유지

---

### Connection Loading Screen

서버 연결 검증 중 표시되는 로딩 화면.   

연결 완료 전까지 사용자 입력을 제한.

---

### Data Transfer Screen

HealthKit 기반 생체 데이터를 서버로 전송하는 화면.

- 전송 성공
  - 마지막 전송 시간 표시
  - 데이터 전달 완료 메시지 출력

- 전송 실패
  - 오류 메시지 출력
  - 재시도 가능
 
---

## 5. HealthKit Integration

앱은 Apple Health 데이터를 읽기 위해    
HealthKit 권한을 요청.

### Access Data

- Heart Rate
- SpO2

---

### Permission Flow

앱 최초 실행 시 HealthKit 권한 요청 팝업을 표시.

권한 거부 시 설정 앱 이동을 통해 권한 재설정을 지원.

---

## 6. Data Flow

```
Apple Watch
        ↓
Apple Health (iPhone)
        ↓
VitaCore iOS Relay App
        ↓
VitaCore Backend API
        ↓
MariaDB
```

---

## 7. API Communication

iOS 앱은 Backend REST API 기반으로 통신.

### 주요 요청

- 연결 코드 검증 요청
- 바이탈 데이터 업로드 요청

### 특징

- HTTPS 기반 통신
- 인증된 연결 코드만 데이터 전송 허용
- Backend API 기반 데이터 검증 수행

---

## 8. Security Design

iOS 앱은 Connection Code 기반 인증 구조를 사용.

- 만료된 연결 코드 사용 제한
- 사용 완료 코드 재사용 차단
- 서버 검증 완료 후 데이터 전송 허용
- 등록된 device_identifier 기반 기기 검증 수행

### Zero Trust Concept

모든 요청은 서버에서 매 요청마다 검증.

신뢰하지 않고 검증하는 구조를 기반으로 설계.

--- 

## 9. Error Handling

다음 상황에 대한 예외 처리를 구성.

- 연결 코드 검증 실패
- 네트워크 오류
- 서버 응답 실패
- HealthKit 권한 거부
- 데이터 전송 실패
- 타임아웃 발생

오류 발생 시 사용자에게 재시도 흐름을 제공.

---

## 10. Device Test

실제 iPhone 및 Apple Watch 환경에서 테스트 수행.

- HealthKit 권한 요청 검증
- 실측 Heart Rate 데이터 전송 검증
- 연결 코드 기반 기기 등록 검증
- Backend API 연동 검증

시뮬레이터 환경에서는 HealthKit 데이터 테스트에 제한 존재.

---

## 11. Notes

iOS 앱은 App Store 배포 목적이 아닌,     
VitaCore 웹 플랫폼과 Apple Health 데이터를 연결하기 위한 Relay Application 역할로 사용.

전체 구조는 Apple Watch → iPhone → Backend API 기반 데이터 흐름 중심으로 구성.
