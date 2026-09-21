param([switch]$BuildOnly)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$url = 'http://localhost:5081/'

function Test-WebReady {
    try {
        $response = Invoke-WebRequest -Uri 'http://127.0.0.1:5081/' -UseBasicParsing -TimeoutSec 5
        return $response.StatusCode -eq 200 -and $response.Headers['X-Landing-Preview'] -eq 'lucas-rosat-cv'
    } catch { return $false }
}

try {
    $nodeCommand = Get-Command node -ErrorAction SilentlyContinue
    $nodePath = if ($nodeCommand) { $nodeCommand.Source } else { $null }
    if (-not $nodePath) {
        $bundledNode = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
        if (Test-Path -LiteralPath $bundledNode) { $nodePath = $bundledNode }
    }
    if (-not $nodePath) { throw 'Se necesita Node.js 20 o superior para generar y probar la web. La web publicada no lo necesita.' }
    $nodeVersion = & $nodePath --version
    if ([int](($nodeVersion -replace '^v', '') -split '\.')[0] -lt 20) { throw 'Se necesita Node.js 20 o superior.' }

    & $nodePath (Join-Path $projectRoot 'scripts\build.mjs')
    if ($LASTEXITCODE -ne 0) { throw 'No se pudo generar la web. Revisa el error anterior.' }
    if ($BuildOnly) { Write-Host 'Lista para publicar: carpeta dist'; exit 0 }
    if (Test-WebReady) { Start-Process $url; exit 0 }

    Write-Host 'Iniciando la vista local. Deja esta ventana abierta mientras la uses.'
    $serverScript = Join-Path $projectRoot 'scripts\serve.mjs'
    $server = Start-Process -FilePath $nodePath -ArgumentList @(('"' + $serverScript + '"')) -WorkingDirectory $projectRoot -NoNewWindow -PassThru
    $deadline = (Get-Date).AddSeconds(20)
    $ready = $false
    while ((Get-Date) -lt $deadline) {
        if ($server.HasExited) { throw 'La vista local no pudo iniciarse. Revisa si el puerto 5081 esta ocupado.' }
        if (Test-WebReady) { $ready = $true; break }
        Start-Sleep -Milliseconds 250
    }
    if (-not $ready) { throw 'La vista local no respondio a tiempo.' }
    Start-Process $url
    Write-Host "Web abierta en $url"
    Write-Host 'Para detenerla, presiona Ctrl+C o cierra esta ventana.'
    $server.WaitForExit()
    exit $server.ExitCode
} catch {
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
