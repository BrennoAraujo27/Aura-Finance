@echo off
echo ============================================================
echo   AURA FINANCE - COMPILADOR AUTOMATICO DO APK ANDROID
echo ============================================================
echo.

where flutter >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERRO] O comando 'flutter' nao foi encontrado no seu PATH do Windows.
    echo.
    echo Para compilar o APK:
    echo 1. Baixe o Flutter SDK em: https://docs.flutter.dev/get-started/install/windows
    echo 2. Extraia para C:\src\flutter
    echo 3. Adicione 'C:\src\flutter\bin' nas Variaveis de Ambiente do Windows (PATH).
    echo.
    pause
    exit /b 1
)

echo [1/3] Obtendo dependencias do projeto...
call flutter pub get

echo.
echo [2/3] Compilando APK Release para Android...
call flutter build apk --release

echo.
echo ============================================================
echo [3/3] SUCESSO! O APK foi gerado em:
echo build\app\outputs\flutter-apk\app-release.apk
echo ============================================================
echo.
pause
