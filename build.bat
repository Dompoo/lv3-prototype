@echo off
REM Cleen Chrome Extension 빌드 스크립트 (Windows)

echo 🏗️  Cleen Chrome Extension 빌드 시작...

REM 빌드 디렉토리 정리
if exist "dist" (
    echo 기존 dist 폴더 정리 중...
    rmdir /s /q dist
)

REM dist 폴더 생성
mkdir dist

echo 📁 파일 복사 중...

REM 필수 파일들 복사
copy manifest.json dist\
copy popup.html dist\
copy popup.js dist\
copy background.js dist\
copy content.js dist\
copy styles.css dist\

REM 아이콘 폴더 복사 (있는 경우)
if exist "icons" (
    xcopy /e /i icons dist\icons
) else (
    echo ⚠️  아이콘 폴더가 없습니다. 기본 아이콘을 추가해주세요.
    mkdir dist\icons
    echo 아이콘 파일이 필요합니다. icons\README.md를 참조하세요. > dist\icons\README.txt
)

echo 🔧 API 키 설정 확인...
findstr /c:"YOUR_GEMINI_API_KEY_HERE" dist\background.js >nul
if %errorlevel% equ 0 (
    echo ⚠️  경고: Gemini API 키가 설정되지 않았습니다.
    echo    dist\background.js 파일에서 'YOUR_GEMINI_API_KEY_HERE'를 실제 API 키로 교체해주세요.
)

echo 📦 패키징 준비 완료!
echo.
echo ✅ 빌드가 완료되었습니다!
echo 📂 빌드 결과: dist\ 폴더
echo.
echo 📋 다음 단계:
echo 1. dist\background.js에서 Gemini API 키 설정
echo 2. 필요시 dist\icons\ 폴더에 아이콘 파일 추가
echo 3. Chrome에서 chrome://extensions/ 접속
echo 4. '개발자 모드' 활성화
echo 5. '압축해제된 확장 프로그램을 로드합니다' 클릭 후 dist 폴더 선택
echo.
echo 🎉 확장 프로그램 설치 완료!
pause