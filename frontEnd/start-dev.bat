@echo off
set NODE_ENV=development
set HOME=%CD%\.node_home
set APPDATA=%CD%\.node_appdata
set LOCALAPPDATA=%CD%\.node_localappdata

mkdir %HOME% 2>nul
mkdir %APPDATA% 2>nul
mkdir %LOCALAPPDATA% 2>nul

echo Using custom environment settings:
echo HOME=%HOME%
echo APPDATA=%APPDATA%
echo LOCALAPPDATA=%LOCALAPPDATA%

npx vite 