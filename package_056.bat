@echo off
cd /d E:\PROJECTS\server-cook-vite
echo Building...
call npm run build > build_log.txt 2>&1
echo Packaging...
call npx @vscode/vsce package --allow-missing-repository --out server-cook-0.5.6.vsix > vsce_log.txt 2>&1
echo Done.
dir *.vsix
