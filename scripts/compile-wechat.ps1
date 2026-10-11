$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$devtoolsRoot = Get-ChildItem -LiteralPath 'C:\Program Files (x86)\Tencent' -Directory |
  Where-Object { Test-Path -LiteralPath (Join-Path $_.FullName 'cli.bat') } |
  Select-Object -First 1 -ExpandProperty FullName

if (-not $devtoolsRoot) {
  throw 'WeChat DevTools installation was not found.'
}

$wcc = Join-Path $devtoolsRoot 'code\package.nw\node_modules\wcc-exec\wcc.exe'
$wcsc = Join-Path $devtoolsRoot 'code\package.nw\node_modules\wcc-exec\wcsc.exe'

if (-not (Test-Path -LiteralPath $wcc) -or -not (Test-Path -LiteralPath $wcsc)) {
  throw 'The bundled wcc/wcsc compiler was not found.'
}

$wxmlFiles = Get-ChildItem -Path (Join-Path $projectRoot 'miniprogram') -Recurse -Filter '*.wxml'
$wxssFiles = Get-ChildItem -Path (Join-Path $projectRoot 'miniprogram') -Recurse -Filter '*.wxss'
$failed = @()

foreach ($file in $wxmlFiles) {
  $output = & $wcc -d $file.FullName 2>&1
  if ($LASTEXITCODE -ne 0) {
    $failed += [PSCustomObject]@{
      File = $file.FullName
      Output = ($output -join "`n")
    }
  }
}

foreach ($file in $wxssFiles) {
  $output = & $wcsc -lc $file.FullName 2>&1
  if ($LASTEXITCODE -ne 0) {
    $failed += [PSCustomObject]@{
      File = $file.FullName
      Output = ($output -join "`n")
    }
  }
}

if ($failed.Count) {
  foreach ($item in $failed) {
    Write-Error "Compile failed: $($item.File)`n$($item.Output)"
  }
  exit 1
}

Write-Output "WXML compile passed: $($wxmlFiles.Count) files"
Write-Output "WXSS compile passed: $($wxssFiles.Count) files"
