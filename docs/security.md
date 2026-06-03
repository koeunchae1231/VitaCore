# VitaCore Security Notes

본 문서는 VitaCore의 보안 설계 구조와 실제 구현 내용을 정리.

CSAP 기준과 Zero Trust 개념을 일부 참고하였으나,   
실제 인증 획득 목적이 아닌 졸업 프로젝트 및 포트폴리오 수준의 설명 가능한 보안 구조 구현을 목표로 구성.

VitaCore는 JWT 기반 인증, 접근 제어, 기기 검증, 이벤트 로깅, 데이터 무결성 추적 구조를 중심으로 보안 기능을 구현.

---

## Security Principles

VitaCore는 다음 보안 원칙을 기반으로 설계.

- Least Privilege
> 필요 최소 권한만 허용하는 접근 구조를 적용.

- Stateless Authentication
> JWT 기반 인증 구조를 사용하며 서버 세션 상태에 의존하지 않음.

- Defense in Depth
> 인증, 기기 검증, 접근 제어, 이벤트 로그를 다중 계층으로 구성.

- Device-based Verification
> 등록된 기기 기반으로 측정값 전송 권한을 검증.

- Immutable Logging
> 주요 보안 이벤트를 수정하지 않고 로그 형태로 기록.

---

## Authentication & Authorization

회원가입 시 비밀번호 원문은 저장하지 않음.

비밀번호는 bcrypt 기반 해시 처리 후 users.password_hash 컬럼에 저장.

로그인 성공 시 JWT를 발급하며,    
JWT Payload에는 userId, email 기반 최소 정보만 포함.

JWT에는 만료 시간을 설정하여 장시간 인증 유지 위험을 제한.

인증이 필요한 API는 Authorization: Bearer <token> 구조를 사용하며,    
authMiddleware에서 모든 요청마다 JWT를 검증.

캐릭터 조회, 수정, 삭제, 측정값 조회는    
JWT 기반 사용자 소유권 검증 후 수행.

로그인 응답과 /api/me 응답에는 password_hash를 포함하지 않음.

---

## Environment-based API Configuration

개발 환경과 운영 환경의 API Base URL을 분리하여 관리.

Frontend는 VITE_API_BASE_URL 환경변수를 사용하여 API 주소를 구성.

개발 환경에서는 localhost 기반 API를 사용하고,    
운영 환경에서는 HTTPS 기반 API 사용을 전제로 구성.

---

## Device Verification & Access Control

외부 기기 및 iOS 앱 연결은 connection_codes.code 기반으로 수행.

연결 코드는 만료 시간을 가지며,    
새 코드 생성 시 기존 활성 코드는 만료 처리.

연결 코드는 사용 후 is_used, used_at 값을 기록하여 재사용을 차단.

연결 성공 시 app_devices에 다음 정보를 저장.

- device_identifier
- device_name
- character_id
- last_active_at
- is_active

측정값 입력 시 등록된 device_identifier 기반 기기인지 검증.

등록되지 않은 기기 또는 비활성 기기의 측정값 전송은 거부하며,   
관련 이벤트를 security_events에 기록.

devicePolicyService.markInactiveDevices()는   
30일 이상 last_active_at이 갱신되지 않은 기기를 비활성 처리.

devicePolicyService.isDeviceExpired()는   
단일 기기의 만료 여부를 검증.

관련 이벤트는 DEVICE_INACTIVE, DEVICE_REJECTED 유형으로 기록.

---

## Lightweight Anomaly Detection

측정값 저장 시 경량 임계치 기반 이상 탐지를 수행.

다음 기준을 기반으로 이상 여부를 판단.

- HR >= 180 또는 HR <= 35
- SpO2 <= 85
- RR >= 40 또는 RR <= 6
- TEMP >= 41 또는 TEMP <= 32
- SBP <= 70 또는 SBP >= 200
- DBP <= 40 또는 DBP >= 130

이상 탐지 발생 시 ANOMALY_DETECTED 이벤트를 security_events에 기록.

Frontend Character View는 위험 상태를 Warning 로그 형태로 표시.

---

## Audit Logging

logSecurityEvent()는 다음 정보를 공통 입력으로 사용.

- userId
- eventType
- targetType
- targetId
- description
- ipAddress

security_events 테이블은 다음 구조를 사용.

- user_id
- type
- target_type
- target_id
- ip_address
- description
- created_at

주요 보안 이벤트는 다음 유형으로 기록.

- AUTH_LOGIN_FAILED
- EMAIL_VERIFICATION_SUCCESS
- DEVICE_CONNECTED
- DEVICE_REJECTED
- MANUAL_VITAL_UPDATED
- COMMAND_APPLIED
- ANOMALY_DETECTED

민감 정보 원문은 로그에 저장하지 않음.

- 비밀번호 원문
- JWT 원문
- 이메일 인증 코드 원문
- 연결 코드 원문

오래된 보안 이벤트는 security_event_archives 테이블로 이관.

archiveOldSecurityEvents(days = 90)는    
created_at 기준 90일 이상 지난 로그를 아카이브 테이블로 이동 후 원본 테이블에서 제거.

아카이브 과정은 트랜잭션 기반으로 처리하여 데이터 정합성을 유지.

---

## Data Integrity

원본 측정값은 직접 수정하지 않음.

수동 수정 또는 시뮬레이션 결과는 새로운 measurement 레코드로 저장.

source_type을 통해 device, simulation, manual 데이터를 구분.

original_measurement_id를 통해 원본 데이터와 수정 데이터를 연결.

데이터 변경 이력 추적과 감사 가능성을 확보하기 위해 Immutable Data Design 기반 구조를 적용.
