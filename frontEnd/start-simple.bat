@echo off
echo Starting Vite with minimal configuration...

rem Use a subdirectory for npm cache
set npm_config_cache=.\.npm-cache
rem Avoid userprofile access
set USERPROFILE=%CD%\.user-profile
rem Disable experimental features
set NODE_OPTIONS=--no-experimental-fetch --no-warnings

rem Run vite directly through node to avoid cmd wrapper issues
node .\node_modules\vite\bin\vite.js 