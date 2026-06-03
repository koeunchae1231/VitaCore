# VitaCore Architecture Design
      
본 문서는 VitaCore의 개발 방법론, 아키텍처 스타일, 설계 원칙, 디자인 패턴, 데이터 설계 전략, API 연동 구조를 정리.    
보안 상세 설계는 security.md에서 별도 관리.

---

## 1. Development Methodology

VitaCore는 Agile Methodology 기반으로 개발.      

초기에는 웹 기반 시뮬레이션 기능을 중심으로 구현하고, 이후 백엔드 API, 데이터베이스, 인증 구조, iOS 앱 연동, 실측 데이터 전송 기능을 단계적으로 확장.      
      
- Incremental Development
> 기능을 회원가입, 로그인, 캐릭터 생성, 바이탈 시뮬레이션,       
> 연결 코드, iOS 연동, 실측 데이터 전송 순서로 단계적으로 구현.    

- Iterative Development
> 기능 구현 후 실제 화면과 API 동작을 검증하고     
> 예외 처리, 입력 검증, 이벤트 로그, UI 흐름을 반복적으로 수정.    

- Prototype-based Validation
> 핵심 기능을 우선 구현하고 실제 동작 여부를 검증하는 방식으로 개발.

---

## 2. Architecture Style

VitaCore는 Client-Server Architecture와 Layered Architecture 기반으로 구성.  

웹 클라이언트, iOS 앱, 백엔드 서버, 데이터베이스의 책임을 분리하여 각 구성 요소가 독립적인 역할을 수행하도록 설계.  

- Client-Server Architecture
> React 기반 웹 클라이언트와 SwiftUI 기반 iOS 앱은 사용자 인터페이스와 입력을 담당.   
> Node.js Express 백엔드는 인증, 비즈니스 로직, 데이터 처리를 담당.   

- Layered Architecture
> routes, controllers, services, validators, middlewares, utils 계층으로 분리하여 요청 처리 흐름을 구성.   

- RESTful Architecture
> 웹 클라이언트와 iOS 앱은 REST API를 통해 백엔드와 통신하며,    
> 클라이언트는 데이터베이스에 직접 접근하지 않음.  

- Modular Architecture
> 인증, 캐릭터, 연결 코드, 측정값, 이벤트 로그 등 기능 단위를 모듈로 분리하여 유지보수성과 확장성을 확보.

---

## 3. Software Design Principles

VitaCore는 역할 분리와 유지보수성을 고려하여 다음 설계 원칙을 적용.

- Separation of Concerns
> 프론트엔드, 백엔드, iOS 앱, 데이터베이스의 책임을 분리.   
> 백엔드 내부에서도 라우팅, 요청 제어, 서비스 로직, 검증 로직, 공통 유틸을 분리.   

- Single Responsibility Principle
> 각 모듈은 하나의 책임을 중심으로 구성.   
> authService는 인증 로직, measurementService는 측정값 처리, securityEventService는 이벤트 로그 기록을 담당.  

- Low Coupling
> 웹 클라이언트와 iOS 앱은 백엔드 API를 통해서만 연결되며 내부 구현에 직접 의존하지 않도록 구성.   

- High Cohesion
> 인증, 캐릭터 관리, 기기 연결, 측정값 처리처럼 관련 기능끼리 같은 모듈 안에 구성.    

---

## 4. Applied Design Patterns

VitaCore는 구조적 역할 분리와 상태 처리 흐름을 위해 다음 디자인 패턴 및 패턴 기반 구조를 적용.

### MVC Pattern

백엔드 Express 구조는 MVC Pattern 기반으로 구성.

- Route → API 엔드포인트 정의
- Controller → 요청 및 응답 흐름 제어
- Service → 비즈니스 로직 처리
- Database Layer → 데이터 저장 및 조회 처리

---

### Layered Pattern

백엔드는 Presentation Layer, Application Layer, Domain Logic Layer, Data Access Layer 구조로 분리.

- Presentation Layer → React Web / SwiftUI iOS
- Application Layer → Express Controller / Middleware
- Domain Logic Layer → Service 계층
- Data Access Layer → MariaDB / dbQuery

각 계층의 책임을 분리하여 유지보수성과 확장성을 확보.

---

### Strategy Pattern Concept

바이탈 종류와 명령어 종류에 따라 서로 다른 처리 로직을 적용.

- HR → 심박수 기준 검증
- SpO2 → 산소포화도 기준 검증
- APPLY_HEAT → 고온 상태 처리
- APPLY_BLEEDING → 출혈 상태 처리

동일한 처리 흐름 내부에서 조건에 따라 다른 알고리즘을 선택하는 구조를 적용.

---

### Command Pattern Concept

시뮬레이션 명령어 입력 구조에 Command Pattern 기반 개념을 적용.

사용자는 APPLY_OXYGEN, APPLY_BLEEDING, APPLY_HEAT 등의 명령어를 입력하고,      
시스템은 명령어를 해석하여 상태 변경과 이벤트 로그 기록을 수행.

명령어는 단순 문자열이 아니라 시스템 상태를 변경하는 요청 단위로 동작.

---

### Observer Pattern Concept

바이탈 데이터 변경 후 Character Page와 Vital Page에 동일 상태를 반영하는 구조를 적용.

측정값 또는 시뮬레이션 값 변경 시 관련 화면에서 최신 데이터를 다시 조회하고 렌더링.

하나의 상태 변경이 여러 화면 상태에 반영되는 Observer Pattern 기반 흐름을 구성.
