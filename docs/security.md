# VitaCore Security Notes

이 문서는 VitaCore 보안 설계 슬라이드와 실제 구현을 연결하기 위한 개발 문서입니다. CSAP 기준을 참고했지만, 실제 CSAP 인증 획득을 의미하지 않으며 졸업 프로젝트/포트폴리오 수준의 설명 가능한 구현을 목표로 합니다.

## 계정 정보 보호

- 회원가입 시 비밀번호 원문은 저장하지 않습니다.
- 백엔드는 `bcrypt`로 비밀번호를 해시한 뒤 `users.password_hash`에 저장합니다.
- 로그인 성공 시 JWT를 발급합니다.
- JWT payload는 `userId`, `email` 중심의 최소 정보만 포함합니다.
- JWT에는 만료 시간이 설정되어 있습니다.
- 인증이 필요한 API는 `Authorization: Bearer <token>`을 `authMiddleware`에서 매 요청마다 검증합니다.
- 로그인 응답과 `/api/me` 응답에는 `password_hash`를 포함하지 않습니다.

## API Base URL과 HTTPS 배포 전제

- 프론트엔드는 `VITE_API_BASE_URL` 환경변수로 API base URL을 분리합니다.
- 개발 환경에서는 `http://localhost:3000/api`를 기본값으로 허용합니다.
- production 배포에서는 HTTPS API URL을 `VITE_API_BASE_URL`로 지정하는 것을 전제로 합니다.

## 접근 제어와 소유권 검증

- 캐릭터 API는 `characters.user_id`와 JWT의 `userId`가 일치하는지 확인합니다.
- 캐릭터 조회, 수정, 삭제, 측정값 조회는 본인 소유 캐릭터만 접근할 수 있습니다.
- 연결 코드 생성도 소유 캐릭터인지 확인한 뒤에만 가능합니다.
- 측정값 입력은 등록된 `device_identifier` 기반 기기인지 확인합니다.
- 등록되지 않은 기기 또는 비활성 기기의 측정값 전송은 거부하고 `security_events`에 기록합니다.

## 연결 코드 기반 기기 등록

- 외부 기기/iOS 앱 연결은 `connection_codes.code` 기반으로 수행합니다.
- 연결 코드는 만료 시간이 있고, 기존 활성 코드는 새 코드 생성 시 만료 처리됩니다.
- 연결 코드는 사용 후 `is_used`, `used_at`으로 재사용을 차단합니다.
- 연결 성공 시 `app_devices`에 `device_identifier`, `device_name`, `character_id`, `last_active_at`, `is_active`를 저장합니다.
- 현재 DB 필드명은 `last_seen_at` 대신 `last_active_at`을 사용하며, 의미상 마지막 기기 접속 시각입니다.

## 장기 미접속 기기 관리

- `devicePolicyService.markInactiveDevices()`는 30일 이상 `last_active_at`이 갱신되지 않은 기기를 `is_active = false`로 처리합니다.
- `devicePolicyService.isDeviceExpired()`는 단일 기기의 만료 여부를 판단합니다.
- 비활성 또는 만료 기기의 측정값 전송은 거부됩니다.
- 관련 이벤트는 `DEVICE_INACTIVE`, `DEVICE_REJECTED`로 기록합니다.

## 이상 탐지와 알람

측정값 저장 시 다음 기준으로 경량 이상 탐지를 수행합니다.

- HR >= 180 또는 HR <= 35
- SpO2 <= 85
- RR >= 40 또는 RR <= 6
- TEMP >= 41 또는 TEMP <= 32
- SBP <= 70 또는 SBP >= 200
- DBP <= 40 또는 DBP >= 130

이상이 감지되면 `ANOMALY_DETECTED`를 `security_events`에 기록합니다. 프론트의 Character View는 위험 상태를 빨간 warning 로그로 표시합니다.

## 보안 이벤트 로그

`logSecurityEvent()`는 다음 정보를 공통 입력으로 받습니다.

- `userId`
- `eventType`
- `targetType`
- `targetId`
- `description`
- `ipAddress`

`security_events` 테이블은 `user_id`, `type`, `target_type`, `target_id`, `ip_address`, `description`, `created_at` 구조를 사용합니다. `description`에는 순수 설명만 저장하고, 대상 리소스와 IP 정보는 별도 컬럼에 저장합니다.

오래된 보안 이벤트는 삭제하지 않고 `security_event_archives` 테이블로 이관합니다. 서버 시작 시 `security_event_archives` 테이블을 `security_events`와 동일한 구조로 보장하며, `archiveOldSecurityEvents(days = 90)` 함수는 `created_at < DATE_SUB(NOW(), INTERVAL ? DAY)` 조건의 로그를 트랜잭션 안에서 아카이브 테이블로 복사한 뒤 원본 테이블에서 제거합니다. 기본 보관 기준은 90일입니다.

주요 이벤트 예시:

- `AUTH_SIGNUP`
- `AUTH_LOGIN_SUCCESS`
- `AUTH_LOGIN_FAILED`
- `EMAIL_VERIFICATION_SENT`
- `EMAIL_VERIFICATION_SUCCESS`
- `CHARACTER_CREATED`
- `CHARACTER_DELETED`
- `CONNECTION_CODE_CREATED`
- `CONNECTION_CODE_USED`
- `DEVICE_CONNECTED`
- `DEVICE_INACTIVE`
- `DEVICE_REJECTED`
- `MEASUREMENT_CREATED`
- `MANUAL_VITAL_UPDATED`
- `COMMAND_APPLIED`
- `ANOMALY_DETECTED`

민감정보인 비밀번호 원문, JWT 원문, 이메일 인증 코드 원문, 연결 코드 원문은 로그에 남기지 않습니다.
