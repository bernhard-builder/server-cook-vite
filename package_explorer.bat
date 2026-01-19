cd E:\PROJECTS\server-cook-vite
call npm run build
call vsce package --allow-missing-repository --out server-cook-0.5.3.vsix
dir *.vsix
