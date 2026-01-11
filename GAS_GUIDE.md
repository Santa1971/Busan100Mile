# Google Apps Script (GAS) 연동 가이드

부산 갈맷길 100M 웹사이트의 데이터를 실제로 저장하고 관리하기 위해 구글 스프레드시트와 스크립트를 연동하는 방법입니다.

## 1단계: 구글 스프레드시트 생성
1. [Google Sheets](https://sheets.google.com)에 접속하여 **'새 스프레드시트'**를 만듭니다.
2. 제목을 **"Busan100M Database"** 등으로 설정합니다.
3. 브라우저 주소창에서 `d/` 와 `/edit` 사이의 긴 문자열(ID)을 복사해둡니다.
   - 예: `https://docs.google.com/spreadsheets/d/abc12345.../edit` -> **`abc12345...`**

## 2단계: Apps Script 작성
1. 스프레드시트 메뉴에서 **확장 프로그램 > Apps Script**를 클릭합니다.
2. `Code.gs` 파일의 내용을 모두 지우고, 이 프로젝트의 **`Code.gs`** 파일 내용을 복사하여 붙여넣습니다.
3. 코드 맨 윗부분의 `SPREADSHEET_ID` 변수 값을 1단계에서 복사한 **ID**로 변경합니다.
   ```javascript
   const SPREADSHEET_ID = '여기에_복사한_ID_입력';
   ```
4. **저장** (디스켓 아이콘) 버튼을 누릅니다.
5. 상단 함수 목록에서 `setupSpreadsheet`를 선택하고 **실행** 버튼을 누릅니다.
   - (권한 허용 창이 뜨면: 권한 검토 > 계정 선택 > 고급 > 안전하지 않음(이동) > 허용)
   - 실행이 완료되면 스프레드시트 하단에 Config, Notices 등 여러 시트 탭이 생성되었는지 확인합니다.

## 3단계: 웹 앱 배포
1. Apps Script 화면 오른쪽 위의 **배포 (Deploy) > 새 배포 (New deployment)**를 클릭합니다.
2. 톱니바퀴 아이콘 > **웹 앱 (Web app)**을 선택합니다.
3. 설정:
   - **설명:** "Version 1"
   - **다음 사용자로 실행:** "나 (Me)"
   - **액세스 권한이 있는 사용자:** **"모든 사용자 (Anyone)"** (중요!)
4. **배포** 버튼을 클릭합니다.
5. 생성된 **웹 앱 URL** (`https://script.google.com/macros/s/.../exec`)을 복사합니다.

## 4단계: 웹사이트에 연결
1. 이 프로젝트의 **`js/app.js`** 파일을 엽니다.
2. 맨 위쪽 `API_URL` 변수의 값을 3단계에서 복사한 **웹 앱 URL**로 변경합니다.
   ```javascript
   const API_URL = 'https://script.google.com/macros/s/새로운_URL_붙여넣기/exec';
   ```
3. 변경 사항을 저장하고 깃허브에 올리면 연동이 완료됩니다!
