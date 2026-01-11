# 배포 가이드 (Deployment Guide)

이 문서는 최적화된 이벤트 사이트 코드를 배포하는 방법을 설명합니다.

**중요:** 프론트엔드(`js/app.js`)가 기존 API URL을 계속 사용할 수 있도록, 기존 배포를 업데이트해야 합니다.

## 1. Google Apps Script (Backend) 업데이트

1. Google Drive에서 연결된 **Apps Script 프로젝트**를 엽니다.
2. `Code.gs` 파일을 엽니다.
3. 기존 코드를 모두 지우고, 이 리포지토리의 `Code.gs` 내용을 복사하여 붙여넣습니다.
4. `Ctrl + S` (또는 `Cmd + S`)를 눌러 저장합니다.
5. 상단 메뉴에서 **배포(Deploy)** > **배포 관리(Manage deployments)**를 클릭합니다.
6. 왼쪽 목록에서 현재 활성화된(Active) 배포를 선택합니다 (연필 아이콘 클릭).
7. **버전(Version)** 드롭다운 메뉴에서 **새 버전(New version)**을 선택합니다.
8. **배포(Deploy)**를 클릭하여 업데이트를 완료합니다.

*참고: 이렇게 하면 기존 웹 앱 URL이 유지되므로, 프론트엔드 코드에서 URL을 수정할 필요가 없습니다.*

## 2. Frontend 업데이트

1. 이 리포지토리의 `js/app.js` 파일을 엽니다.
2. 기존 `js/app.js` 내용을 새 코드로 교체합니다.
3. (필요한 경우) `index.html`이 `#countdown-card` ID를 올바르게 가지고 있는지 확인합니다.

## 3. 변경 사항 확인

1. 웹 사이트에 접속합니다.
2. 개발자 도구(F12) > Network 탭을 엽니다.
3. 페이지를 새로고침합니다.
4. 개별 API 호출(`getConfig`, `getNotices` 등) 대신 하나의 `getInitialData` 호출만 발생하는지 확인합니다.
5. 데이터 로딩 속도가 개선되었는지 확인합니다.
