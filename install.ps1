param(
    [Parameter(Position=0)]
    [ValidatePattern('^(stable|latest|\d+\.\d+\.\d+(-[^\s]+)?)$')]
    [string]$Target = "latest"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$ProgressPreference = 'SilentlyContinue'

# Check for 32-bit Windows
if (-not [Environment]::Is64BitProcess) {
    Write-Error "O Claude Code não suporta Windows de 32 bits. Por favor, use uma versão de 64 bits do Windows."
    exit 1
}

$DOWNLOAD_BASE_URL = "https://downloads.claude.ai/claude-code-releases"
$DOWNLOAD_DIR = "$env:USERPROFILE\.claude\downloads"

# Use native ARM64 binary on ARM64 Windows, x64 otherwise
if ($env:PROCESSOR_ARCHITECTURE -eq "ARM64") {
    $platform = "win32-arm64"
} else {
    $platform = "win32-x64"
}
New-Item -ItemType Directory -Force -Path $DOWNLOAD_DIR | Out-Null

# Always download latest version (which has the most up-to-date installer)
try {
    $version = Invoke-RestMethod -Uri "$DOWNLOAD_BASE_URL/latest" -ErrorAction Stop
}
catch {
    Write-Error "Falha ao obter a versão mais recente: $_"
    exit 1
}

try {
    $manifest = Invoke-RestMethod -Uri "$DOWNLOAD_BASE_URL/$version/manifest.json" -ErrorAction Stop
    $checksum = $manifest.platforms.$platform.checksum

    if (-not $checksum) {
        Write-Error "Plataforma $platform não encontrada no manifesto"
        exit 1
    }
}
catch {
    Write-Error "Falha ao obter o manifesto: $_"
    exit 1
}

# Download and verify
$binaryPath = "$DOWNLOAD_DIR\claude-$version-$platform.exe"
try {
    Invoke-WebRequest -Uri "$DOWNLOAD_BASE_URL/$version/$platform/claude.exe" -OutFile $binaryPath -ErrorAction Stop
}
catch {
    Write-Error "Falha ao baixar o binário: $_"
    if (Test-Path $binaryPath) {
        Remove-Item -Force $binaryPath
    }
    exit 1
}

# Calculate checksum
$actualChecksum = (Get-FileHash -Path $binaryPath -Algorithm SHA256).Hash.ToLower()

if ($actualChecksum -ne $checksum) {
    Write-Error "Falha na verificação do checksum"
    Remove-Item -Force $binaryPath
    exit 1
}

# Run claude install to set up launcher and shell integration
Write-Output "Configurando o Claude Code..."
try {
    if ($Target) {
        & $binaryPath install $Target
    }
    else {
        & $binaryPath install
    }
}
finally {
    try {
        # Clean up downloaded file
        # Wait a moment for any file handles to be released
        Start-Sleep -Seconds 1
        Remove-Item -Force $binaryPath
    }
    catch {
        Write-Warning "Não foi possível remover o arquivo temporário: $binaryPath"
    }
}

Write-Output ""
Write-Output "$([char]0x2705) Instalação concluída!"
Write-Output ""
