param(
  [Parameter(Mandatory = $true)]
  [ValidateSet("publish", "publish-batch", "verify", "audit", "preflight")]
  [string]$Command,

  [string[]]$ProjectPath,

  [string]$ProjectsRootPath,

  [string]$SourcePath = "",

  [string]$OutputRelativePath = ".github/copilot-instructions.md",

  [switch]$CopySourceFiles,

  [string]$SourceFilesRelativePath = ".github/copilot-instructions-sources",

  [switch]$RequireSourceFiles,

  [switch]$RequireGit,

  [switch]$Recurse
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Resolve-SourceRoot {
  param([string]$InputSourcePath)

  if (-not [string]::IsNullOrWhiteSpace($InputSourcePath)) {
    if (-not (Test-Path -LiteralPath $InputSourcePath)) {
      throw "SourcePath nao encontrado: $InputSourcePath"
    }

    return (Resolve-Path -LiteralPath $InputSourcePath).Path
  }

  if (-not [string]::IsNullOrWhiteSpace($PSCommandPath)) {
    $scriptDir = Split-Path -Parent $PSCommandPath
    return (Split-Path -Parent $scriptDir)
  }

  return (Get-Location).Path
}

function Get-OrderedFiles {
  return @(
    "copilot-instructions.md",
    "copilot-instructions-dsc.md",
    "guard-autenticacao.md",
    "heuristicas-codigo.md",
    "clean-code-architecture-design-patterns.md",
    "offline-pwa.md",
    "performance.md"
  )
}

function Assert-SourceFiles {
  param(
    [string]$ResolvedSourceRoot,
    [string[]]$Files
  )

  foreach ($file in $Files) {
    $filePath = Join-Path $ResolvedSourceRoot $file
    if (-not (Test-Path -LiteralPath $filePath)) {
      throw "Arquivo de instrucao ausente: $filePath"
    }
  }
}

function New-InstructionsContent {
  param(
    [string]$ResolvedSourceRoot,
    [string[]]$Files,
    [string]$Timestamp
  )

  $builder = New-Object System.Collections.Generic.List[string]
  $builder.Add("# Copilot Instructions")
  $builder.Add("")
  $builder.Add("Arquivo gerado automaticamente por scripts/copilot-instructions.ps1.")
  $builder.Add("Fonte: $ResolvedSourceRoot")
  $builder.Add("Gerado em: $Timestamp")
  $builder.Add("")

  foreach ($file in $Files) {
    $sourceFile = Join-Path $ResolvedSourceRoot $file
    $builder.Add("---")
    $builder.Add("")
    $builder.Add("## Fonte: $file")
    $builder.Add("")

    $content = Get-Content -LiteralPath $sourceFile -Raw -Encoding UTF8
    $builder.Add($content.TrimEnd())
    $builder.Add("")
  }

  return ($builder -join [Environment]::NewLine)
}

function ConvertTo-NormalizedText {
  param([string]$Text)
  if ($null -eq $Text) { return "" }

  $normalized = $Text -replace "`r`n", "`n"
  return $normalized.TrimEnd("`n")
}

function Publish-Instructions {
  param(
    [string[]]$Projects,
    [string]$ResolvedSourceRoot,
    [string]$OutputPath,
    [switch]$CopySources,
    [string]$SourcesRelativePath,
    [string[]]$Files
  )

  foreach ($project in $Projects) {
    if (-not (Test-Path -LiteralPath $project)) {
      Write-Warning "Projeto ignorado (nao encontrado): $project"
      continue
    }

    $projectRoot = (Resolve-Path -LiteralPath $project).Path
    $outputFile = Join-Path $projectRoot $OutputPath
    $outputDir = Split-Path -Parent $outputFile

    if (-not (Test-Path -LiteralPath $outputDir)) {
      New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
    }

    $payload = New-InstructionsContent -ResolvedSourceRoot $ResolvedSourceRoot -Files $Files -Timestamp (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
    Set-Content -LiteralPath $outputFile -Value $payload -Encoding UTF8
    Write-Host "Gerado: $outputFile"

    if ($CopySources) {
      $sourceTarget = Join-Path $projectRoot $SourcesRelativePath
      if (-not (Test-Path -LiteralPath $sourceTarget)) {
        New-Item -ItemType Directory -Path $sourceTarget -Force | Out-Null
      }

      foreach ($file in $Files) {
        Copy-Item -LiteralPath (Join-Path $ResolvedSourceRoot $file) -Destination (Join-Path $sourceTarget $file) -Force
      }

      Write-Host "Arquivos fonte copiados para: $sourceTarget"
    }
  }
}

function Find-Projects {
  param(
    [string]$RootPath,
    [string]$ResolvedSourceRoot,
    [switch]$OnlyGit,
    [switch]$Recursive
  )

  if (-not (Test-Path -LiteralPath $RootPath)) {
    throw "ProjectsRootPath nao encontrado: $RootPath"
  }

  $projectsRoot = (Resolve-Path -LiteralPath $RootPath).Path
  $candidates = Get-ChildItem -LiteralPath $projectsRoot -Directory -Recurse:$Recursive
  $projects = New-Object System.Collections.Generic.List[string]

  foreach ($candidate in $candidates) {
    if ($candidate.FullName -eq $ResolvedSourceRoot) {
      continue
    }

    $hasSln = $null -ne (Get-ChildItem -Path $candidate.FullName -Filter "*.sln" -File -ErrorAction SilentlyContinue | Select-Object -First 1)
    $hasProjectMarkers = @(
      (Test-Path -LiteralPath (Join-Path $candidate.FullName "package.json")),
      (Test-Path -LiteralPath (Join-Path $candidate.FullName "angular.json")),
      (Test-Path -LiteralPath (Join-Path $candidate.FullName "pom.xml")),
      $hasSln
    ) -contains $true

    if (-not $hasProjectMarkers) {
      continue
    }

    if ($OnlyGit -and -not (Test-Path -LiteralPath (Join-Path $candidate.FullName ".git"))) {
      continue
    }

    $projects.Add($candidate.FullName)
  }

  return $projects
}

function Get-DiffLineNumbers {
  param(
    [string]$ExpectedText,
    [string]$ActualText,
    [int]$MaxLines = 50
  )

  $expectedLines = @()
  if (-not [string]::IsNullOrEmpty($ExpectedText)) {
    $expectedLines = $ExpectedText -split "`n", 0
  }

  $actualLines = @()
  if (-not [string]::IsNullOrEmpty($ActualText)) {
    $actualLines = $ActualText -split "`n", 0
  }

  $total = [Math]::Max($expectedLines.Count, $actualLines.Count)
  $diffs = New-Object System.Collections.Generic.List[int]

  for ($i = 0; $i -lt $total; $i++) {
    $expectedLine = if ($i -lt $expectedLines.Count) { $expectedLines[$i] } else { "" }
    $actualLine = if ($i -lt $actualLines.Count) { $actualLines[$i] } else { "" }

    if ($expectedLine -ne $actualLine) {
      $diffs.Add($i + 1)
      if ($diffs.Count -ge $MaxLines) {
        break
      }
    }
  }

  return $diffs
}

function Format-LineNumbersForReport {
  param(
    [System.Collections.Generic.List[int]]$LineNumbers,
    [int]$TotalDiffCount
  )

  if ($null -eq $LineNumbers -or $LineNumbers.Count -eq 0) {
    return "-"
  }

  $text = ($LineNumbers | ForEach-Object { $_.ToString() }) -join ", "
  if ($TotalDiffCount -gt $LineNumbers.Count) {
    $remaining = $TotalDiffCount - $LineNumbers.Count
    return "$text (+$remaining linhas)"
  }

  return $text
}

function New-ReportItem {
  param(
    [string]$Target,
    [string]$Status,
    [string]$FailedLines,
    [string]$Details
  )

  return [PSCustomObject]@{
    Target      = $Target
    Status      = $Status
    FailedLines = $FailedLines
    Details     = $Details
  }
}

function Write-VerifyReport {
  param(
    [string]$ProjectRoot,
    [string]$ProjectInput,
    [System.Collections.Generic.List[object]]$Items,
    [switch]$NeedSourceFiles
  )

  $docsDir = Join-Path $ProjectRoot "docs"
  if (-not (Test-Path -LiteralPath $docsDir)) {
    New-Item -ItemType Directory -Path $docsDir -Force | Out-Null
  }

  $reportPath = Join-Path $docsDir "relatorioCopilot.md"
  $generatedAt = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  $failedCount = @($Items | Where-Object { $_.Status -eq "noPass" }).Count
  $overallStatus = if ($failedCount -gt 0) { "noPass" } else { "Pass" }
  $mode = if ($NeedSourceFiles) { "verify + RequireSourceFiles" } else { "verify" }

  $builder = New-Object System.Collections.Generic.List[string]
  $builder.Add("# Relatorio Copilot")
  $builder.Add("")
  $builder.Add("- Projeto: $ProjectRoot")
  $builder.Add("- Entrada analisada: $ProjectInput")
  $builder.Add("- Modo: $mode")
  $builder.Add("- Gerado em: $generatedAt")
  $builder.Add("- Status geral: $overallStatus")
  $builder.Add("")
  $builder.Add("| Arquivo analisado | Status | Linhas noPass | Detalhes |")
  $builder.Add("| --- | --- | --- | --- |")

  foreach ($item in $Items) {
    $target = $item.Target.Replace("|", "\|")
    $status = $item.Status
    $lines = $item.FailedLines.Replace("|", "\|")
    $details = $item.Details.Replace("|", "\|")
    $builder.Add("| $target | $status | $lines | $details |")
  }

  $payload = $builder -join [Environment]::NewLine
  Set-Content -LiteralPath $reportPath -Value $payload -Encoding UTF8
  Write-Host "Relatorio gerado: $reportPath"
}

function Test-Instructions {
  param(
    [string[]]$Projects,
    [string]$ResolvedSourceRoot,
    [string]$OutputPath,
    [switch]$NeedSourceFiles,
    [string]$SourcesRelativePath,
    [string[]]$Files
  )

  $expectedRaw = New-InstructionsContent -ResolvedSourceRoot $ResolvedSourceRoot -Files $Files -Timestamp "__TIMESTAMP__"
  $expectedNormalized = ConvertTo-NormalizedText -Text $expectedRaw
  $expectedWithoutTimestamp = $expectedNormalized -replace "Gerado em: .*", "Gerado em: __TIMESTAMP__"

  $hasFailure = $false

  foreach ($project in $Projects) {
    $projectHasFailure = $false
    $reportItems = New-Object System.Collections.Generic.List[object]

    if (-not (Test-Path -LiteralPath $project)) {
      Write-Host "[FAIL] Projeto nao encontrado: $project"
      $hasFailure = $true
      continue
    }

    $projectRoot = (Resolve-Path -LiteralPath $project).Path
    $outputFile = Join-Path $projectRoot $OutputPath

    if (-not (Test-Path -LiteralPath $outputFile)) {
      Write-Host "[FAIL] Instrucoes nao encontradas em: $outputFile"
      Write-Host "       Acao: execute scripts/copilot-instructions.ps1 -Command publish para este projeto."
      $reportItems.Add((New-ReportItem -Target $outputFile -Status "noPass" -FailedLines "N/A" -Details "Arquivo principal nao encontrado."))
      Write-VerifyReport -ProjectRoot $projectRoot -ProjectInput $project -Items $reportItems -NeedSourceFiles:$NeedSourceFiles
      $hasFailure = $true
      continue
    }

    $actualRaw = Get-Content -LiteralPath $outputFile -Raw -Encoding UTF8
    $actualNormalized = ConvertTo-NormalizedText -Text $actualRaw
    $actualWithoutTimestamp = $actualNormalized -replace "Gerado em: .*", "Gerado em: __TIMESTAMP__"

    if ($actualWithoutTimestamp -ne $expectedWithoutTimestamp) {
      $allDiffLines = Get-DiffLineNumbers -ExpectedText $expectedWithoutTimestamp -ActualText $actualWithoutTimestamp -MaxLines 100000
      $shownDiffLines = Get-DiffLineNumbers -ExpectedText $expectedWithoutTimestamp -ActualText $actualWithoutTimestamp -MaxLines 50
      $lineText = Format-LineNumbersForReport -LineNumbers $shownDiffLines -TotalDiffCount $allDiffLines.Count
      Write-Host "[FAIL] Divergencia de conteudo: $outputFile"
      Write-Host "       Acao: republicar instrucoes para atualizar o arquivo gerado."
      $reportItems.Add((New-ReportItem -Target $outputFile -Status "noPass" -FailedLines $lineText -Details "Conteudo divergente em relacao ao esperado."))
      $projectHasFailure = $true
    }
    else {
      Write-Host "[PASS] Arquivo principal valido: $outputFile"
      $reportItems.Add((New-ReportItem -Target $outputFile -Status "Pass" -FailedLines "-" -Details "Arquivo principal em conformidade."))
    }

    if ($NeedSourceFiles) {
      $sourceTarget = Join-Path $projectRoot $SourcesRelativePath

      if (-not (Test-Path -LiteralPath $sourceTarget)) {
        Write-Host "[FAIL] Pasta de fontes nao encontrada: $sourceTarget"
        $reportItems.Add((New-ReportItem -Target $sourceTarget -Status "noPass" -FailedLines "N/A" -Details "Pasta de fontes auxiliares nao encontrada."))
        $projectHasFailure = $true
      }
      else {
        foreach ($file in $Files) {
          $expectedSource = Join-Path $ResolvedSourceRoot $file
          $projectSource = Join-Path $sourceTarget $file

          if (-not (Test-Path -LiteralPath $projectSource)) {
            Write-Host "[FAIL] Fonte ausente no projeto: $projectSource"
            $reportItems.Add((New-ReportItem -Target $projectSource -Status "noPass" -FailedLines "N/A" -Details "Arquivo fonte auxiliar ausente no projeto."))
            $projectHasFailure = $true
            continue
          }

          $srcExpected = ConvertTo-NormalizedText -Text (Get-Content -LiteralPath $expectedSource -Raw -Encoding UTF8)
          $srcActual = ConvertTo-NormalizedText -Text (Get-Content -LiteralPath $projectSource -Raw -Encoding UTF8)

          if ($srcExpected -ne $srcActual) {
            $allDiffLines = Get-DiffLineNumbers -ExpectedText $srcExpected -ActualText $srcActual -MaxLines 100000
            $shownDiffLines = Get-DiffLineNumbers -ExpectedText $srcExpected -ActualText $srcActual -MaxLines 50
            $lineText = Format-LineNumbersForReport -LineNumbers $shownDiffLines -TotalDiffCount $allDiffLines.Count
            Write-Host "[FAIL] Fonte divergente no projeto: $projectSource"
            $reportItems.Add((New-ReportItem -Target $projectSource -Status "noPass" -FailedLines $lineText -Details "Conteudo do fonte auxiliar divergente."))
            $projectHasFailure = $true
          }
          else {
            $reportItems.Add((New-ReportItem -Target $projectSource -Status "Pass" -FailedLines "-" -Details "Fonte auxiliar em conformidade."))
          }
        }

        if (-not $projectHasFailure) {
          Write-Host "[PASS] Fontes auxiliares validas: $sourceTarget"
        }
      }
    }

    Write-VerifyReport -ProjectRoot $projectRoot -ProjectInput $project -Items $reportItems -NeedSourceFiles:$NeedSourceFiles

    if ($projectHasFailure) {
      $hasFailure = $true
    }
  }

  if ($hasFailure) {
    exit 1
  }

  Write-Host "Verificacao concluida sem falhas."
  exit 0
}

function Get-AuditRules {
  return @(
    # ---- TypeScript ----
    [PSCustomObject]@{
      Id          = "TS001"
      Description = "Uso de 'any' proibido"
      Extensions  = @(".ts")
      Pattern     = ":\s*any\b"
      Exclude     = ""
    },
    [PSCustomObject]@{
      Id          = "TS002"
      Description = "Decorador @Input() proibido (usar input())"
      Extensions  = @(".ts")
      Pattern     = "@Input\s*\("
      Exclude     = ""
    },
    [PSCustomObject]@{
      Id          = "TS003"
      Description = "Decorador @Output() proibido (usar output())"
      Extensions  = @(".ts")
      Pattern     = "@Output\s*\("
      Exclude     = ""
    },
    [PSCustomObject]@{
      Id          = "TS004"
      Description = "Decorador @ViewChild() proibido (usar viewChild())"
      Extensions  = @(".ts")
      Pattern     = "@ViewChild\s*\("
      Exclude     = ""
    },
    [PSCustomObject]@{
      Id          = "TS005"
      Description = "Decorador @ViewChildren() proibido (usar viewChildren())"
      Extensions  = @(".ts")
      Pattern     = "@ViewChildren\s*\("
      Exclude     = ""
    },
    [PSCustomObject]@{
      Id          = "TS006"
      Description = "Decorador @ContentChild() proibido (usar contentChild())"
      Extensions  = @(".ts")
      Pattern     = "@ContentChild\s*\("
      Exclude     = ""
    },
    [PSCustomObject]@{
      Id          = "TS007"
      Description = "Decorador @ContentChildren() proibido (usar contentChildren())"
      Extensions  = @(".ts")
      Pattern     = "@ContentChildren\s*\("
      Exclude     = ""
    },
    [PSCustomObject]@{
      Id          = "TS008"
      Description = "Decorador @HostBinding() proibido (usar host no metadata)"
      Extensions  = @(".ts")
      Pattern     = "@HostBinding\s*\("
      Exclude     = ""
    },
    [PSCustomObject]@{
      Id          = "TS009"
      Description = "Decorador @HostListener() proibido (usar host no metadata)"
      Extensions  = @(".ts")
      Pattern     = "@HostListener\s*\("
      Exclude     = ""
    },
    [PSCustomObject]@{
      Id          = "TS010"
      Description = "Injecao de dependencia via constructor proibida (usar inject())"
      Extensions  = @(".ts")
      Pattern     = "constructor\s*\(\s*(private|public|protected|readonly)"
      Exclude     = ""
    },
    [PSCustomObject]@{
      Id          = "TS011"
      Description = "subscribe() manual em componente proibido"
      Extensions  = @(".component.ts")
      Pattern     = "\.subscribe\s*\("
      Exclude     = ""
    },
    [PSCustomObject]@{
      Id          = "TS012"
      Description = "EventEmitter proibido (usar output())"
      Extensions  = @(".ts")
      Pattern     = "EventEmitter"
      Exclude     = ""
    },
    [PSCustomObject]@{
      Id          = "TS013"
      Description = "NgModule proibido (usar standalone)"
      Extensions  = @(".ts")
      Pattern     = "@NgModule\s*\("
      Exclude     = ""
    },
    [PSCustomObject]@{
      Id          = "TS014"
      Description = "AppRoutingModule proibido (usar app.routes.ts)"
      Extensions  = @(".ts")
      Pattern     = "AppRoutingModule"
      Exclude     = ""
    },
    # ---- HTML Templates ----
    [PSCustomObject]@{
      Id          = "HTML001"
      Description = "*ngIf proibido (usar @if)"
      Extensions  = @(".html")
      Pattern     = "\*ngIf"
      Exclude     = ""
    },
    [PSCustomObject]@{
      Id          = "HTML002"
      Description = "*ngFor proibido (usar @for)"
      Extensions  = @(".html")
      Pattern     = "\*ngFor"
      Exclude     = ""
    },
    [PSCustomObject]@{
      Id          = "HTML003"
      Description = "*ngSwitch/*ngSwitchCase proibido (usar @switch)"
      Extensions  = @(".html")
      Pattern     = "\*ngSwitch"
      Exclude     = ""
    },
    [PSCustomObject]@{
      Id          = "HTML004"
      Description = "ng-template para controle de fluxo proibido"
      Extensions  = @(".html")
      Pattern     = "<ng-template"
      Exclude     = ""
    },
    # ---- Estilos ----
    [PSCustomObject]@{
      Id          = "CSS001"
      Description = "Cor hexadecimal hardcoded proibida (usar tokens DSC)"
      Extensions  = @(".scss", ".css")
      Pattern     = "#[0-9a-fA-F]{3,8}\b"
      Exclude     = ""
    },
    # ---- Facade e Feature ----
    [PSCustomObject]@{
      Id          = "TS015"
      Description = "Store injetado diretamente em componente (usar Facade)"
      Extensions  = @(".component.ts")
      Pattern     = "inject\s*\(\s*Store\s*[,\)]"
      Exclude     = ""
    },
    [PSCustomObject]@{
      Id          = "TS016"
      Description = "store.dispatch() chamado diretamente em componente (usar Facade)"
      Extensions  = @(".component.ts")
      Pattern     = "\.dispatch\s*\("
      Exclude     = ""
    },
    [PSCustomObject]@{
      Id          = "TS017"
      Description = "store.select() chamado diretamente em componente (usar Facade)"
      Extensions  = @(".component.ts")
      Pattern     = "\.select\s*\("
      Exclude     = ""
    }
  )
}

function Invoke-FileAudit {
  param(
    [string]$FilePath,
    [array]$Rules
  )

  $violations = New-Object System.Collections.Generic.List[object]
  $ext = [System.IO.Path]::GetExtension($FilePath).ToLower()
  $fileName = [System.IO.Path]::GetFileName($FilePath).ToLower()

  $lines = Get-Content -LiteralPath $FilePath -Encoding UTF8 -ErrorAction SilentlyContinue
  if ($null -eq $lines) { return $violations }

  foreach ($rule in $Rules) {
    $applies = $false
    foreach ($ruleExt in $rule.Extensions) {
      if ($ruleExt -eq $ext) { $applies = $true; break }
      # extensao composta ex: .component.ts
      if ($fileName.EndsWith($ruleExt)) { $applies = $true; break }
    }

    if (-not $applies) { continue }

    for ($i = 0; $i -lt $lines.Count; $i++) {
      $line = $lines[$i]
      # ignorar linhas de comentario
      $trimmed = $line.TrimStart()
      if ($trimmed.StartsWith("//") -or $trimmed.StartsWith("*") -or $trimmed.StartsWith("/*")) { continue }

      if ($line -match $rule.Pattern) {
        $violations.Add([PSCustomObject]@{
            Rule        = $rule.Id
            Description = $rule.Description
            Line        = $i + 1
            Content     = $line.Trim()
          })
      }
    }
  }

  return $violations
}

function Invoke-StructuralAudit {
  param(
    [string]$SrcPath
  )

  $findings = New-Object System.Collections.Generic.List[object]
  $statesPath = Join-Path $SrcPath "app" | Join-Path -ChildPath "states"

  if (-not (Test-Path -LiteralPath $statesPath)) {
    # Tentar encontrar estados em qualquer subfolder de app/
    $statesPath = Get-ChildItem -Path (Join-Path $SrcPath "app") -Directory -Recurse -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -eq "states" } | Select-Object -First 1 -ExpandProperty FullName
  }

  if (-not $statesPath -or -not (Test-Path -LiteralPath $statesPath)) {
    $findings.Add([PSCustomObject]@{
        Rule        = "ARC001"
        Description = "Pasta states/ nao encontrada - estrutura de Feature nao identificada"
        Target      = "src/app/states"
        Status      = "noPass"
      })
    return $findings
  }

  $featureFolders = Get-ChildItem -Path $statesPath -Directory -ErrorAction SilentlyContinue

  if ($null -eq $featureFolders -or @($featureFolders).Count -eq 0) {
    $findings.Add([PSCustomObject]@{
        Rule        = "ARC001"
        Description = "Nenhuma feature encontrada em states/"
        Target      = $statesPath
        Status      = "noPass"
      })
    return $findings
  }

  $requiredSuffixes = @("actions.ts", "reducer.ts", "effects.ts", "selectors.ts", "state.ts", "facade.ts")

  foreach ($featureDir in $featureFolders) {
    $featureName = $featureDir.Name
    $featurePath = $featureDir.FullName
    $filesInFeature = Get-ChildItem -Path $featurePath -File -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name

    foreach ($suffix in $requiredSuffixes) {
      $expectedFile = "$featureName.$suffix"
      if (-not ($filesInFeature -contains $expectedFile)) {
        $rule = if ($suffix -eq "facade.ts") { "ARC002" } else { "ARC001" }
        $findings.Add([PSCustomObject]@{
            Rule        = $rule
            Description = "Feature '$featureName' sem arquivo obrigatorio: $expectedFile"
            Target      = "states/$featureName/$expectedFile"
            Status      = "noPass"
          })
      }
    }

    if (-not ($findings | Where-Object { $_.Target -like "*$featureName*" })) {
      $findings.Add([PSCustomObject]@{
          Rule        = "ARC001"
          Description = "Feature '$featureName' com estrutura completa"
          Target      = "states/$featureName"
          Status      = "Pass"
        })
    }
  }

  return $findings
}

function Write-AuditReport {
  param(
    [string]$ProjectRoot,
    [string]$ProjectInput,
    [System.Collections.Generic.List[object]]$FileResults,
    [System.Collections.Generic.List[object]]$StructuralFindings = $null
  )

  $docsDir = Join-Path $ProjectRoot "docs"
  if (-not (Test-Path -LiteralPath $docsDir)) {
    New-Item -ItemType Directory -Path $docsDir -Force | Out-Null
  }

  $reportPath = Join-Path $docsDir "relatorioAudit.md"
  $generatedAt = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

  $totalFiles = $FileResults.Count
  $filesWithFail = @($FileResults | Where-Object { $_.Violations.Count -gt 0 }).Count
  $totalViolations = ($FileResults | ForEach-Object { $_.Violations.Count } | Measure-Object -Sum).Sum
  $structuralFails = if ($StructuralFindings) { @($StructuralFindings | Where-Object { $_.Status -eq "noPass" }).Count } else { 0 }
  $overallStatus = if ($filesWithFail -gt 0 -or $structuralFails -gt 0) { "noPass" } else { "Pass" }

  $builder = New-Object System.Collections.Generic.List[string]
  $builder.Add("# Relatorio de Auditoria de Codigo")
  $builder.Add("")
  $builder.Add("- Projeto: $ProjectRoot")
  $builder.Add("- Entrada analisada: $ProjectInput")
  $builder.Add("- Gerado em: $generatedAt")
  $builder.Add("- Arquivos analisados: $totalFiles")
  $builder.Add("- Arquivos com violacoes: $filesWithFail")
  $builder.Add("- Total de violacoes: $totalViolations")
  $builder.Add("- Falhas estruturais (Feature/Facade): $structuralFails")
  $builder.Add("- Status geral: $overallStatus")
  $builder.Add("")

  foreach ($fileResult in ($FileResults | Where-Object { $_.Violations.Count -gt 0 })) {
    $relPath = $fileResult.RelativePath.Replace("\", "/")
    $builder.Add("## $relPath")
    $builder.Add("")
    $builder.Add("| Regra | Descricao | Linha | Trecho |")
    $builder.Add("| --- | --- | --- | --- |")

    foreach ($v in $fileResult.Violations) {
      $trecho = $v.Content.Replace("|", "\|").Replace("`n", " ")
      if ($trecho.Length -gt 80) { $trecho = $trecho.Substring(0, 80) + "..." }
      $builder.Add("| $($v.Rule) | $($v.Description) | $($v.Line) | ``$trecho`` |")
    }

    $builder.Add("")
  }

  if ($filesWithFail -eq 0) {
    if ($structuralFails -eq 0) {
      $builder.Add("Nenhuma violacao encontrada. Codigo em conformidade com as instrucoes.")
    }
  }

  if ($StructuralFindings -and $StructuralFindings.Count -gt 0) {
    $builder.Add("## Analise Estrutural (Feature / Facade)")
    $builder.Add("")
    $builder.Add("| Regra | Descricao | Alvo | Status |")
    $builder.Add("| --- | --- | --- | --- |")
    foreach ($sf in $StructuralFindings) {
      $builder.Add("| $($sf.Rule) | $($sf.Description) | $($sf.Target) | $($sf.Status) |")
    }
    $builder.Add("")
  }

  $payload = $builder -join [Environment]::NewLine
  Set-Content -LiteralPath $reportPath -Value $payload -Encoding UTF8
  Write-Host "Relatorio de auditoria gerado: $reportPath"
}

function Invoke-ProjectAudit {
  param(
    [string[]]$Projects
  )

  $rules = Get-AuditRules
  $hasFailure = $false

  foreach ($project in $Projects) {
    if (-not (Test-Path -LiteralPath $project)) {
      Write-Host "[FAIL] Projeto nao encontrado: $project"
      $hasFailure = $true
      continue
    }

    $projectRoot = (Resolve-Path -LiteralPath $project).Path
    $srcPath = Join-Path $projectRoot "src"

    if (-not (Test-Path -LiteralPath $srcPath)) {
      Write-Warning "Pasta src nao encontrada em: $projectRoot. Auditando raiz do projeto."
      $srcPath = $projectRoot
    }

    Write-Host "Auditando codigo em: $srcPath"

    $extensions = @("*.ts", "*.html", "*.scss", "*.css")
    $allFiles = New-Object System.Collections.Generic.List[string]
    foreach ($ext in $extensions) {
      $found = Get-ChildItem -Path $srcPath -Filter $ext -Recurse -File -ErrorAction SilentlyContinue |
      Where-Object { $_.FullName -notmatch "\\node_modules\\" -and $_.FullName -notmatch "\\dist\\" -and $_.Name -notmatch "\.spec\.ts$" }
      foreach ($f in $found) { $allFiles.Add($f.FullName) }
    }

    $fileResults = New-Object System.Collections.Generic.List[object]
    $totalViol = 0

    foreach ($filePath in $allFiles) {
      $violations = @(Invoke-FileAudit -FilePath $filePath -Rules $rules)
      $relPath = $filePath.Substring($projectRoot.Length).TrimStart("\", "/")
      $fileResults.Add([PSCustomObject]@{
          RelativePath = $relPath
          Violations   = $violations
        })

      if ($violations.Count -gt 0) {
        $totalViol += $violations.Count
        foreach ($v in $violations) {
          Write-Host "[noPass] $relPath ($($v.Rule) linha $($v.Line)): $($v.Description)"
        }
      }
    }

    $filesOk = @($fileResults | Where-Object { $_.Violations.Count -eq 0 }).Count
    $filesFail = @($fileResults | Where-Object { $_.Violations.Count -gt 0 }).Count

    Write-Host ""
    Write-Host "Arquivos analisados : $($fileResults.Count)"
    Write-Host "Sem violacoes       : $filesOk"
    Write-Host "Com violacoes       : $filesFail"
    Write-Host "Total de violacoes  : $totalViol"

    if ($totalViol -gt 0) {
      Write-Host "[noPass] Projeto com violacoes de conformidade: $projectRoot"
      $hasFailure = $true
    }
    else {
      Write-Host "[Pass] Codigo em conformidade: $projectRoot"
    }

    # Auditoria estrutural de Feature/Facade
    Write-Host ""
    Write-Host "Analisando estrutura de Features e Facades..."
    $structuralFindings = @(Invoke-StructuralAudit -SrcPath $srcPath)
    $structuralFails = @($structuralFindings | Where-Object { $_.Status -eq "noPass" })
    foreach ($sf in $structuralFindings) {
      $icon = if ($sf.Status -eq "Pass") { "[Pass]" } else { "[noPass]" }
      Write-Host "$icon [$($sf.Rule)] $($sf.Description)"
    }
    if ($structuralFails.Count -gt 0) {
      Write-Host "[noPass] Estrutura de Feature/Facade com falhas: $($structuralFails.Count) problema(s)"
      $hasFailure = $true
    }
    else {
      Write-Host "[Pass] Estrutura de Feature/Facade em conformidade"
    }

    $structuralList = New-Object System.Collections.Generic.List[object]
    foreach ($sf in $structuralFindings) { $structuralList.Add($sf) }

    Write-AuditReport -ProjectRoot $projectRoot -ProjectInput $project -FileResults $fileResults -StructuralFindings $structuralList
  }

  if ($hasFailure) {
    exit 1
  }

  Write-Host "Auditoria concluida sem violacoes."
  exit 0
}

function New-PreflightStepItem {
  param(
    [string]$Step,
    [string]$Status,
    [int]$Weight,
    [string]$Details
  )

  return [PSCustomObject]@{
    Step    = $Step
    Status  = $Status
    Weight  = $Weight
    Details = $Details
  }
}

function Invoke-LocalScriptCommand {
  param(
    [string]$ScriptPath,
    [string]$SubCommand,
    [string]$ProjectRoot,
    [string]$ResolvedSourceRoot,
    [switch]$NeedSourceFiles
  )

  $args = @(
    "-NoProfile",
    "-ExecutionPolicy", "Bypass",
    "-File", $ScriptPath,
    "-Command", $SubCommand,
    "-ProjectPath", $ProjectRoot,
    "-SourcePath", $ResolvedSourceRoot
  )

  if ($NeedSourceFiles) {
    $args += "-RequireSourceFiles"
  }

  & powershell.exe @args
  $exitCode = if ($null -ne $LASTEXITCODE) { [int]$LASTEXITCODE } elseif ($?) { 0 } else { 1 }
  return $exitCode
}

function Invoke-ProjectNativeStep {
  param(
    [string]$ProjectRoot,
    [string]$Executable,
    [string[]]$Arguments
  )

  $exitCode = 1
  $errorText = ""

  try {
    Push-Location $ProjectRoot
    & $Executable @Arguments
    $exitCode = if ($null -ne $LASTEXITCODE) { [int]$LASTEXITCODE } elseif ($?) { 0 } else { 1 }
  }
  catch {
    $exitCode = 1
    $errorText = $_.Exception.Message
  }
  finally {
    Pop-Location
  }

  return [PSCustomObject]@{
    ExitCode = $exitCode
    Error    = $errorText
  }
}

function Get-NpmScripts {
  param([string]$ProjectRoot)

  $scripts = @{}
  $packageJsonPath = Join-Path $ProjectRoot "package.json"
  if (-not (Test-Path -LiteralPath $packageJsonPath)) {
    return $scripts
  }

  try {
    $json = Get-Content -LiteralPath $packageJsonPath -Raw -Encoding UTF8 | ConvertFrom-Json
    if ($null -ne $json.scripts) {
      foreach ($p in $json.scripts.PSObject.Properties) {
        $scripts[$p.Name] = [string]$p.Value
      }
    }
  }
  catch {
    Write-Warning "Nao foi possivel ler scripts do package.json em: $projectRoot"
  }

  return $scripts
}

function Get-CoveragePercent {
  param([string]$ProjectRoot)

  $coveragePath = Join-Path $ProjectRoot "coverage/coverage-summary.json"
  if (-not (Test-Path -LiteralPath $coveragePath)) {
    return $null
  }

  try {
    $coverage = Get-Content -LiteralPath $coveragePath -Raw -Encoding UTF8 | ConvertFrom-Json
    if ($null -ne $coverage.total.lines.pct) {
      return [double]$coverage.total.lines.pct
    }
  }
  catch {
    return $null
  }

  return $null
}

function Write-PreflightReport {
  param(
    [string]$ProjectRoot,
    [string]$ProjectInput,
    [System.Collections.Generic.List[object]]$Steps
  )

  $docsDir = Join-Path $ProjectRoot "docs"
  if (-not (Test-Path -LiteralPath $docsDir)) {
    New-Item -ItemType Directory -Path $docsDir -Force | Out-Null
  }

  $reportPath = Join-Path $docsDir "relatorioPreflight.md"
  $generatedAt = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

  $failedCount = @($Steps | Where-Object { $_.Status -eq "noPass" }).Count
  $skippedCount = @($Steps | Where-Object { $_.Status -eq "skip" }).Count
  $executed = @($Steps | Where-Object { $_.Status -ne "skip" })

  $executedWeight = ($executed | ForEach-Object { $_.Weight } | Measure-Object -Sum).Sum
  if ($null -eq $executedWeight) { $executedWeight = 0 }

  $passedWeight = (($executed | Where-Object { $_.Status -eq "Pass" }) | ForEach-Object { $_.Weight } | Measure-Object -Sum).Sum
  if ($null -eq $passedWeight) { $passedWeight = 0 }

  $score = if ($executedWeight -gt 0) { [Math]::Round((100.0 * $passedWeight / $executedWeight), 1) } else { 0 }
  $overallStatus = if ($failedCount -gt 0) { "noPass" } else { "Pass" }

  $builder = New-Object System.Collections.Generic.List[string]
  $builder.Add("# Relatorio Preflight")
  $builder.Add("")
  $builder.Add("- Projeto: $ProjectRoot")
  $builder.Add("- Entrada analisada: $ProjectInput")
  $builder.Add("- Gerado em: $generatedAt")
  $builder.Add("- Status geral: $overallStatus")
  $builder.Add("- Nota preflight: $score")
  $builder.Add("- Etapas com noPass: $failedCount")
  $builder.Add("- Etapas ignoradas (skip): $skippedCount")
  $builder.Add("")
  $builder.Add("| Etapa | Status | Peso | Detalhes |")
  $builder.Add("| --- | --- | --- | --- |")

  foreach ($step in $Steps) {
    $lineStep = $step.Step.Replace("|", "\|")
    $lineStatus = $step.Status
    $lineWeight = $step.Weight
    $lineDetails = $step.Details.Replace("|", "\|")
    $builder.Add("| $lineStep | $lineStatus | $lineWeight | $lineDetails |")
  }

  $builder.Add("")
  $builder.Add("Escala sugerida:")
  $builder.Add("- >= 85: pronto para revisao final frontend senior")
  $builder.Add("- 70 a 84.9: precisa ajustes antes da revisao final")
  $builder.Add("- < 70: bloqueado para envio")

  Set-Content -LiteralPath $reportPath -Value ($builder -join [Environment]::NewLine) -Encoding UTF8
  Write-Host "Relatorio preflight gerado: $reportPath"
}

function Invoke-ProjectPreflight {
  param(
    [string[]]$Projects,
    [string]$ResolvedSourceRoot,
    [switch]$NeedSourceFiles
  )

  $scriptPath = $PSCommandPath
  $hasFailure = $false
  $npmAvailable = $null -ne (Get-Command npm -ErrorAction SilentlyContinue)

  foreach ($project in $Projects) {
    $steps = New-Object System.Collections.Generic.List[object]

    if (-not (Test-Path -LiteralPath $project)) {
      Write-Host "[FAIL] Projeto nao encontrado: $project"
      $hasFailure = $true
      continue
    }

    $projectRoot = (Resolve-Path -LiteralPath $project).Path
    Write-Host ""
    Write-Host "=== Preflight: $projectRoot ==="

    # 1) Verify (peso 15)
    $verifyCode = Invoke-LocalScriptCommand -ScriptPath $scriptPath -SubCommand "verify" -ProjectRoot $projectRoot -ResolvedSourceRoot $ResolvedSourceRoot -NeedSourceFiles:$NeedSourceFiles
    if ($verifyCode -eq 0) {
      $steps.Add((New-PreflightStepItem -Step "verify" -Status "Pass" -Weight 15 -Details "Instrucoes publicadas estao em conformidade."))
    }
    else {
      $steps.Add((New-PreflightStepItem -Step "verify" -Status "noPass" -Weight 15 -Details "Falha na verificacao das instrucoes publicadas."))
      $hasFailure = $true
    }

    # 2) Audit (peso 15)
    $auditCode = Invoke-LocalScriptCommand -ScriptPath $scriptPath -SubCommand "audit" -ProjectRoot $projectRoot -ResolvedSourceRoot $ResolvedSourceRoot
    if ($auditCode -eq 0) {
      $steps.Add((New-PreflightStepItem -Step "audit" -Status "Pass" -Weight 15 -Details "Codigo conforme as regras de auditoria."))
    }
    else {
      $steps.Add((New-PreflightStepItem -Step "audit" -Status "noPass" -Weight 15 -Details "Violacoes detectadas no codigo do projeto."))
      $hasFailure = $true
    }

    $scripts = Get-NpmScripts -ProjectRoot $projectRoot
    $hasPackageJson = Test-Path -LiteralPath (Join-Path $projectRoot "package.json")

    if (-not $hasPackageJson) {
      $steps.Add((New-PreflightStepItem -Step "lint" -Status "skip" -Weight 15 -Details "package.json nao encontrado."))
      $steps.Add((New-PreflightStepItem -Step "test" -Status "skip" -Weight 15 -Details "package.json nao encontrado."))
      $steps.Add((New-PreflightStepItem -Step "coverage>=80" -Status "skip" -Weight 10 -Details "package.json nao encontrado."))
      $steps.Add((New-PreflightStepItem -Step "build:production" -Status "skip" -Weight 15 -Details "package.json nao encontrado."))
      $steps.Add((New-PreflightStepItem -Step "security:npm-audit" -Status "skip" -Weight 10 -Details "package.json nao encontrado."))
    }
    elseif (-not $npmAvailable) {
      $steps.Add((New-PreflightStepItem -Step "lint" -Status "skip" -Weight 15 -Details "npm nao disponivel no ambiente."))
      $steps.Add((New-PreflightStepItem -Step "test" -Status "skip" -Weight 15 -Details "npm nao disponivel no ambiente."))
      $steps.Add((New-PreflightStepItem -Step "coverage>=80" -Status "skip" -Weight 10 -Details "npm nao disponivel no ambiente."))
      $steps.Add((New-PreflightStepItem -Step "build:production" -Status "skip" -Weight 15 -Details "npm nao disponivel no ambiente."))
      $steps.Add((New-PreflightStepItem -Step "security:npm-audit" -Status "skip" -Weight 10 -Details "npm nao disponivel no ambiente."))
    }
    else {
      # 3) Lint (peso 15)
      if ($scripts.ContainsKey("lint")) {
        $lintRun = Invoke-ProjectNativeStep -ProjectRoot $projectRoot -Executable "npm" -Arguments @("run", "lint")
        if ($lintRun.ExitCode -eq 0) {
          $steps.Add((New-PreflightStepItem -Step "lint" -Status "Pass" -Weight 15 -Details "npm run lint concluiu sem erros."))
        }
        else {
          $details = if ([string]::IsNullOrWhiteSpace($lintRun.Error)) { "npm run lint retornou codigo $($lintRun.ExitCode)." } else { $lintRun.Error }
          $steps.Add((New-PreflightStepItem -Step "lint" -Status "noPass" -Weight 15 -Details $details))
          $hasFailure = $true
        }
      }
      else {
        $steps.Add((New-PreflightStepItem -Step "lint" -Status "skip" -Weight 15 -Details "Script lint nao encontrado em package.json."))
      }

      # 4) Testes (peso 15)
      $testExecuted = $false
      if ($scripts.ContainsKey("test")) {
        $testRun = Invoke-ProjectNativeStep -ProjectRoot $projectRoot -Executable "npm" -Arguments @("run", "test", "--", "--watch=false", "--code-coverage")
        $testExecuted = $true
        if ($testRun.ExitCode -eq 0) {
          $steps.Add((New-PreflightStepItem -Step "test" -Status "Pass" -Weight 15 -Details "npm run test concluiu sem falhas."))
        }
        else {
          $details = if ([string]::IsNullOrWhiteSpace($testRun.Error)) { "npm run test retornou codigo $($testRun.ExitCode)." } else { $testRun.Error }
          $steps.Add((New-PreflightStepItem -Step "test" -Status "noPass" -Weight 15 -Details $details))
          $hasFailure = $true
        }
      }
      else {
        $steps.Add((New-PreflightStepItem -Step "test" -Status "skip" -Weight 15 -Details "Script test nao encontrado em package.json."))
      }

      # 5) Cobertura minima (peso 10)
      if ($testExecuted) {
        $coveragePct = Get-CoveragePercent -ProjectRoot $projectRoot
        if ($null -eq $coveragePct) {
          $steps.Add((New-PreflightStepItem -Step "coverage>=80" -Status "skip" -Weight 10 -Details "Arquivo coverage-summary.json nao encontrado."))
        }
        elseif ($coveragePct -ge 80) {
          $steps.Add((New-PreflightStepItem -Step "coverage>=80" -Status "Pass" -Weight 10 -Details "Cobertura total de linhas: $coveragePct%."))
        }
        else {
          $steps.Add((New-PreflightStepItem -Step "coverage>=80" -Status "noPass" -Weight 10 -Details "Cobertura abaixo da meta: $coveragePct%."))
          $hasFailure = $true
        }
      }
      else {
        $steps.Add((New-PreflightStepItem -Step "coverage>=80" -Status "skip" -Weight 10 -Details "Teste nao executado."))
      }

      # 6) Build producao (peso 15)
      if ($scripts.ContainsKey("build")) {
        $buildRun = Invoke-ProjectNativeStep -ProjectRoot $projectRoot -Executable "npm" -Arguments @("run", "build", "--", "--configuration", "production")
        if ($buildRun.ExitCode -eq 0) {
          $steps.Add((New-PreflightStepItem -Step "build:production" -Status "Pass" -Weight 15 -Details "Build de producao concluido."))
        }
        else {
          $details = if ([string]::IsNullOrWhiteSpace($buildRun.Error)) { "npm run build retornou codigo $($buildRun.ExitCode)." } else { $buildRun.Error }
          $steps.Add((New-PreflightStepItem -Step "build:production" -Status "noPass" -Weight 15 -Details $details))
          $hasFailure = $true
        }
      }
      else {
        $steps.Add((New-PreflightStepItem -Step "build:production" -Status "skip" -Weight 15 -Details "Script build nao encontrado em package.json."))
      }

      # 7) Seguranca de dependencias (peso 10)
      $auditRun = Invoke-ProjectNativeStep -ProjectRoot $projectRoot -Executable "npm" -Arguments @("audit", "--audit-level=high")
      if ($auditRun.ExitCode -eq 0) {
        $steps.Add((New-PreflightStepItem -Step "security:npm-audit" -Status "Pass" -Weight 10 -Details "Sem vulnerabilidades high/critical."))
      }
      else {
        $details = if ([string]::IsNullOrWhiteSpace($auditRun.Error)) { "npm audit retornou codigo $($auditRun.ExitCode)." } else { $auditRun.Error }
        $steps.Add((New-PreflightStepItem -Step "security:npm-audit" -Status "noPass" -Weight 10 -Details $details))
        $hasFailure = $true
      }
    }

    Write-PreflightReport -ProjectRoot $projectRoot -ProjectInput $project -Steps $steps
  }

  if ($hasFailure) {
    exit 1
  }

  Write-Host "Preflight concluido sem bloqueios."
  exit 0
}

$sourceRoot = Resolve-SourceRoot -InputSourcePath $SourcePath
$orderedFiles = Get-OrderedFiles
Assert-SourceFiles -ResolvedSourceRoot $sourceRoot -Files $orderedFiles

switch ($Command) {
  "publish" {
    if ($null -eq $ProjectPath -or $ProjectPath.Count -eq 0) {
      throw "ProjectPath e obrigatorio para Command=publish"
    }

    Publish-Instructions -Projects $ProjectPath -ResolvedSourceRoot $sourceRoot -OutputPath $OutputRelativePath -CopySources:$CopySourceFiles -SourcesRelativePath $SourceFilesRelativePath -Files $orderedFiles
    break
  }

  "publish-batch" {
    if ([string]::IsNullOrWhiteSpace($ProjectsRootPath)) {
      throw "ProjectsRootPath e obrigatorio para Command=publish-batch"
    }

    $projects = @(Find-Projects -RootPath $ProjectsRootPath -ResolvedSourceRoot $sourceRoot -OnlyGit:$RequireGit -Recursive:$Recurse)
    if ($projects.Count -eq 0) {
      Write-Warning "Nenhum projeto encontrado em: $ProjectsRootPath"
      break
    }

    Write-Host "Projetos encontrados: $($projects.Count)"
    foreach ($project in $projects) {
      Write-Host " - $project"
    }

    Publish-Instructions -Projects $projects -ResolvedSourceRoot $sourceRoot -OutputPath $OutputRelativePath -CopySources:$CopySourceFiles -SourcesRelativePath $SourceFilesRelativePath -Files $orderedFiles
    break
  }

  "verify" {
    if ($null -eq $ProjectPath -or $ProjectPath.Count -eq 0) {
      throw "ProjectPath e obrigatorio para Command=verify"
    }

    Test-Instructions -Projects $ProjectPath -ResolvedSourceRoot $sourceRoot -OutputPath $OutputRelativePath -NeedSourceFiles:$RequireSourceFiles -SourcesRelativePath $SourceFilesRelativePath -Files $orderedFiles
    break
  }

  "audit" {
    if ($null -eq $ProjectPath -or $ProjectPath.Count -eq 0) {
      throw "ProjectPath e obrigatorio para Command=audit"
    }

    Invoke-ProjectAudit -Projects $ProjectPath
    break
  }

  "preflight" {
    if ($null -eq $ProjectPath -or $ProjectPath.Count -eq 0) {
      throw "ProjectPath e obrigatorio para Command=preflight"
    }

    Invoke-ProjectPreflight -Projects $ProjectPath -ResolvedSourceRoot $sourceRoot -NeedSourceFiles:$RequireSourceFiles
    break
  }
}
