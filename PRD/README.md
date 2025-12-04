# PRD 폴더 구조

```
PRD/
├── PRD.md                          # 메인 PRD 문서
├── workflow.md                      # 에이전트 워크플로우
├── technical_architecture.md        # 기술 아키텍처
├── ui_agent_implementation.md       # UI 에이전트 구현 계획
└── README.md                        # 이 파일
```

## 문서 개요

### PRD.md
- 제품 비전 및 목표
- 핵심 기능 명세
- 비즈니스 로직
- 운영 정책
- 성공 지표 (KPI)

### workflow.md
- DocBot 에이전트 작동 흐름 상세
- 각 단계별 파일 및 함수 매핑
- Frontend → AI → Backend → DB 흐름

### technical_architecture.md
- 시스템 전체 아키텍처
- 컴포넌트 상세 명세
- 데이터 변환 로직
- 보안 및 성능 최적화

### ui_agent_implementation.md
- UI Selection Agent 구현 계획
- 단계별 개발 로드맵
- 코드 예시 및 테스트 전략

## 업데이트 정책

- **버전**: 각 문서는 버전 관리됨
- **변경 이력**: 주요 변경 사항은 문서 상단에 기록
- **리뷰**: 기능 추가 시 PRD 먼저 업데이트 후 개발

## 참조

프로젝트 루트의 `workflow.md`와 동기화됨.  
개발 작업 시 PRD 폴더의 문서를 공식 레퍼런스로 사용.
