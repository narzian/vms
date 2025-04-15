$env:NODE_ENV = "development"
$env:HOME = "$PSScriptRoot\.node_home"
$env:APPDATA = "$PSScriptRoot\.node_appdata"
$env:LOCALAPPDATA = "$PSScriptRoot\.node_localappdata"

# Create directories if they don't exist
New-Item -ItemType Directory -Force -Path $env:HOME | Out-Null
New-Item -ItemType Directory -Force -Path $env:APPDATA | Out-Null
New-Item -ItemType Directory -Force -Path $env:LOCALAPPDATA | Out-Null

# Run vite directly
npx --no-install vite 