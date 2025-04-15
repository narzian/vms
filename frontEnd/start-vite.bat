@echo off
echo Starting Vite in compatibility mode...

rem Create custom directories to avoid using AppData
mkdir .node_home 2>nul
mkdir .node_appdata 2>nul

rem Set Node.js options to use compatibility mode
set NODE_OPTIONS=--no-experimental-fetch

rem Start Vite directly using the executable
.\node_modules\.bin\vite.cmd --force 