@echo off
echo 🛸 Installing Orbital Mission Control...
echo.

REM Check Node.js version
echo Checking Node.js version...
node -v
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js not found. Please install Node.js 18 or higher.
    exit /b 1
)
echo.

REM Install root dependencies
echo 📦 Installing extension dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install extension dependencies
    exit /b 1
)
echo ✅ Extension dependencies installed
echo.

REM Install webview dependencies
echo 📦 Installing webview dependencies...
cd webview
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install webview dependencies
    exit /b 1
)
cd ..
echo ✅ Webview dependencies installed
echo.

REM Build everything
echo 🔨 Building extension...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Build failed
    exit /b 1
)
echo ✅ Build successful
echo.

echo 🎉 Installation complete!
echo.
echo Next steps:
echo   1. Press F5 in VSCode to launch the extension
echo   2. Or run 'npm run watch' and 'npm run watch:webview' for development
echo.
echo Happy coding! 🚀
