# Rebuild the game's SWF files from the split parts in swf_parts\.
#
# The SWFs are stored in swf_parts\ as chunks because GitHub rejects files
# larger than 100 MB. This puts the real .swf files back, byte for byte,
# and verifies each one with SHA-256 before it is kept.
#
# Double-click rebuild.bat, or run:
#   powershell -ExecutionPolicy Bypass -File rebuild.ps1
#
# Parameters:
#   -OutDir <path>  rebuild into another folder (default: this folder)
#   -Force          rebuild even if a correct file is already present
param(
    [string]$OutDir = $PSScriptRoot,
    [switch]$Force
)
$ErrorActionPreference = 'Stop'

$here = $PSScriptRoot
$partsDir = Join-Path $here 'swf_parts'
$manifestPath = Join-Path $partsDir 'manifest.json'

if (-not (Test-Path -LiteralPath $manifestPath)) {
    throw "manifest.json not found in '$partsDir'. Run this script from the 'Game Files' folder."
}
if (-not (Test-Path -LiteralPath $OutDir)) { New-Item -ItemType Directory -Path $OutDir | Out-Null }

$manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json

function Get-Sha256([string]$Path) {
    (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash
}

foreach ($entry in $manifest.files) {
    $target = Join-Path $OutDir $entry.name
    Write-Host ("==> {0}" -f $entry.name)

    if (-not $Force -and (Test-Path -LiteralPath $target)) {
        $item = Get-Item -LiteralPath $target
        if ($item.Length -eq $entry.size -and (Get-Sha256 $target) -eq $entry.sha256) {
            Write-Host "    already present and verified - skipping"
            continue
        }
        Write-Host "    existing file is wrong or incomplete - rebuilding"
        Remove-Item -LiteralPath $target -Force
    }

    $tmp = "$target.rebuilding"
    if (Test-Path -LiteralPath $tmp) { Remove-Item -LiteralPath $tmp -Force }

    $out = [System.IO.File]::Create($tmp)
    try {
        foreach ($p in $entry.parts) {
            $partPath = Join-Path $partsDir $p.file
            if (-not (Test-Path -LiteralPath $partPath)) { throw "missing part: $($p.file)" }
            $ps = Get-Item -LiteralPath $partPath
            if ($ps.Length -ne $p.size) {
                throw "part '$($p.file)' has wrong size (expected $($p.size), found $($ps.Length))"
            }
            $in = [System.IO.File]::OpenRead($partPath)
            try { $in.CopyTo($out, 4MB) } finally { $in.Dispose() }
        }
    } catch {
        $out.Dispose()
        Remove-Item -LiteralPath $tmp -Force -ErrorAction SilentlyContinue
        throw
    }
    $out.Dispose()

    $built = Get-Item -LiteralPath $tmp
    if ($built.Length -ne $entry.size -or (Get-Sha256 $tmp) -ne $entry.sha256) {
        Remove-Item -LiteralPath $tmp -Force
        throw "verification failed for '$($entry.name)' - the parts in swf_parts\ are damaged."
    }
    Move-Item -LiteralPath $tmp -Destination $target -Force
    Write-Host ("    rebuilt and verified ({0:N1} MB)" -f ($entry.size / 1MB))
}

Write-Host ""
Write-Host "Done - all SWF files are in place. The game should load now."
