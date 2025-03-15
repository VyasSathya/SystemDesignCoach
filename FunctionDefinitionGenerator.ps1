function Get-FunctionDefinitions {
    param (
        [string]$FilePath
    )

    if (-not (Test-Path $FilePath)) {
        return $false
    }

    try {
        $fileName = Split-Path $FilePath -Leaf
        $content = Get-Content $FilePath -Raw -ErrorAction SilentlyContinue
        if ($null -eq $content) {
            return $false
        }
        # Process file content...
        return $true
    }
    catch {
        Write-Host "Error processing $FilePath" -ForegroundColor Red
        return $false
    }
}

function Get-FolderTree {
    param (
        [string]$Path = (Get-Location),
        [string]$Prefix = "",
        [string[]]$ExcludedDirectories = @('node_modules', '\.next', '\.venv', '\.git', 'dist', 'build'),
        [string[]]$IncludedExtensions = @('.js', '.jsx', '.ts', '.tsx', '.py', '.rb', '.c', '.cpp', '.h', '.hpp', '.cs', '.php', '.go', '.java', '.rs', '.md', '.txt')
    )

    $items = Get-ChildItem -Path $Path -ErrorAction SilentlyContinue
    $totalFiles = 0
    $processedFiles = 0

    foreach ($item in $items) {
        if ($item.PSIsContainer) {
            if ($ExcludedDirectories | Where-Object { $item.Name -match $_ }) {
                continue
            }
            $subResults = Get-FolderTree -Path $item.FullName -ExcludedDirectories $ExcludedDirectories -IncludedExtensions $IncludedExtensions
            $totalFiles += $subResults.TotalFiles
            $processedFiles += $subResults.ProcessedFiles
        }
        elseif ($IncludedExtensions -contains $item.Extension) {
            $totalFiles++
            if (Get-FunctionDefinitions -FilePath $item.FullName) {
                $processedFiles++
            }
        }
    }

    return @{
        TotalFiles = $totalFiles
        ProcessedFiles = $processedFiles
    }
}

Write-Host "Analyzing project structure..." -ForegroundColor Cyan
$results = Get-FolderTree
Write-Host "Analysis complete!" -ForegroundColor Green
Write-Host "Processed $($results.ProcessedFiles) of $($results.TotalFiles) relevant files." -ForegroundColor Yellow
