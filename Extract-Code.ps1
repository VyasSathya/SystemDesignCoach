function Get-FunctionDefinitions {
    param (
      [string]$FilePath
    )
  
    # Read file content, compatible with older PowerShell versions
    try {
      $fileContent = [System.IO.File]::ReadAllText($FilePath)
    } catch {
      $fileContent = $null
    }
    $functions = @()
  
    if ($null -eq $fileContent) {
      return $functions
    }
  
    $extension = [System.IO.Path]::GetExtension($FilePath)
    $fileName = [System.IO.Path]::GetFileName($FilePath)
    $isModule = $fileContent -match 'module\.exports' -or $fileContent -match 'export default' -or $fileContent -match 'export const'
  
    switch ($extension) {
      # JavaScript/TypeScript pattern
      { $_ -in ".js", ".jsx", ".ts", ".tsx" } {
        # Check for class declarations and inheritance
        $classMatches = [regex]::Matches($fileContent, 'class\s+([a-zA-Z0-9_$]+)(?:\s+extends\s+([a-zA-Z0-9_$]+))?')
        foreach ($match in $classMatches) {
          $className = $match.Groups[1].Value
          $visibility = if ($fileContent -match "export\s+(default\s+)?class\s+$className") { "exported" } else { "internal" }
          
          $inheritance = if ($match.Groups[2].Success) { " extends " + $match.Groups[2].Value } else { "" }
          $functions += "class:$className$inheritance [$visibility]"
        }
  
        # Match regular function declarations with parameters
        $functionMatches = [regex]::Matches($fileContent, 'function\s+([a-zA-Z0-9_$]+)\s*\(([^)]*)\)')
        foreach ($match in $functionMatches) {
          $functionName = $match.Groups[1].Value
          $params = $match.Groups[2].Value.Trim()
          $visibility = if ($fileContent -match "export\s+(const\s+)?$functionName" -or 
                           $fileContent -match "module\.exports.*$functionName" -or
                           $fileContent -match "export\s+default\s+$functionName") { "exported" } else { "internal" }
          
          $functions += "function:$functionName($params) [$visibility]"
        }
  
        # Match arrow functions with explicit names
        $arrowFunctionMatches = [regex]::Matches($fileContent, '(?:const|let|var|export const)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:\(([^)]*)\)|([a-zA-Z0-9_$]+))\s*=>')
        foreach ($match in $arrowFunctionMatches) {
          $functionName = $match.Groups[1].Value
          $params = if ($match.Groups[2].Success) { $match.Groups[2].Value } else { $match.Groups[3].Value }
          $params = $params.Trim()
          $visibility = if ($fileContent -match "export\s+const\s+$functionName" -or 
                           $fileContent -match "module\.exports.*$functionName") { "exported" } else { "internal" }
          
          $functions += "arrow:$functionName($params) [$visibility]"
        }
  
        # Match class methods with parameters
        $classMethodMatches = [regex]::Matches($fileContent, '\b(?:async\s+)?([a-zA-Z0-9_$]+)\s*\(([^)]*)\)\s*{')
        foreach ($match in $classMethodMatches) {
          # Filter out keywords that aren't actual methods
          $methodName = $match.Groups[1].Value
          $params = $match.Groups[2].Value.Trim()
          
          if ($methodName -notin @("if", "for", "while", "switch", "catch", "function", "return")) {
            $functions += "method:$methodName($params)"
          }
        }
  
        # Look for React components (function components)
        if ($fileContent -match 'React|react') {
          $componentMatches = [regex]::Matches($fileContent, '(?:export\s+(?:default\s+)?)?(?:function|const)\s+([A-Z][a-zA-Z0-9_$]*)\s*(?:\([^)]*\)|=[^=])')
          foreach ($match in $componentMatches) {
            $componentName = $match.Groups[1].Value
            if ($componentName -notin $functions -and $componentName -cmatch '^[A-Z]') {
              $visibility = if ($fileContent -match "export\s+(default\s+)?(?:function|const)\s+$componentName") { "exported" } else { "internal" }
              $functions += "component:$componentName [$visibility]"
            }
          }
        }
      }
  
      # Python pattern
      ".py" {
        # Match function definitions with parameters
        $pythonFunctionMatches = [regex]::Matches($fileContent, 'def\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)')
        foreach ($match in $pythonFunctionMatches) {
          $functionName = $match.Groups[1].Value
          $params = $match.Groups[2].Value.Trim()
          $visibility = if ($functionName.StartsWith("_")) { "private" } else { "public" }
          
          $functions += "function:$functionName($params) [$visibility]"
        }
  
        # Match class definitions with inheritance
        $pythonClassMatches = [regex]::Matches($fileContent, 'class\s+([a-zA-Z0-9_]+)(?:\(([^)]*)\))?:')
        foreach ($match in $pythonClassMatches) {
          $className = $match.Groups[1].Value
          $inheritance = if ($match.Groups[2].Success) { "(" + $match.Groups[2].Value + ")" } else { "" }
          $visibility = if ($className.StartsWith("_")) { "private" } else { "public" }
          
          $functions += "class:$className$inheritance [$visibility]"
        }
      }
  
      # Other languages can be expanded similarly...
    }
  
    # Add module information if relevant
    if ($isModule) {
      $functions = @("module:$fileName") + $functions
    }
  
    return $functions | Select-Object -Unique
  }
  
  function Get-SourceCodeExtract {
    param (
      [string]$Path = (Get-Location),
      [string[]]$ExcludedDirectories = @('node_modules', '\.next', '\.venv', '\.git', 'dist', 'build'),
      [string[]]$IncludedExtensions = @('.js', '.jsx', '.ts', '.tsx', '.py', '.rb', '.c', '.cpp', '.h', '.hpp', '.cs', '.php', '.go', '.java', '.rs'),
      [string]$OutputFile = "all_source_code.txt"
    )
    
    # Create a StringBuilder for efficient string concatenation
    $stringBuilder = New-Object System.Text.StringBuilder
    
    # Initialize file with timestamp
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    [void]$stringBuilder.AppendLine("# CODE EXTRACTION - $timestamp`n")
    
    # Add the folder tree structure at the top of the file
    [void]$stringBuilder.AppendLine("# PROJECT STRUCTURE")
    $treeOutput = Get-FolderTree | Out-String
    [void]$stringBuilder.AppendLine($treeOutput)
    [void]$stringBuilder.AppendLine("`n")
    
    # Build exclude pattern
    $excludePattern = $ExcludedDirectories -join '|'
    
    # Get all files with specified extensions (excluding specified directories)
    $files = Get-ChildItem -Path $Path -Recurse -File |
             Where-Object { ($_.Extension -in $IncludedExtensions) -and ($_.FullName -notmatch $excludePattern) } |
             Sort-Object FullName
    
    # Counter for progress
    $totalFiles = $files.Count
    $currentFile = 0
    
    foreach ($file in $files) {
      $currentFile++
      $relativeFilePath = $file.FullName.Substring($Path.Length).TrimStart('\', '/')
      
      # Get file content
      try {
        # Read file content, compatible with older PowerShell versions
        $fileContent = [System.IO.File]::ReadAllText($file.FullName)
        
        if ($null -ne $fileContent) {
          # Calculate progress percentage
          $progressPercent = [math]::Round(($currentFile / $totalFiles) * 100, 1)
          Write-Progress -Activity "Extracting source code" -Status "Processing $relativeFilePath" -PercentComplete $progressPercent
          
          # Create separator
          $separator = "=" * 80
          
          # Add to string builder
          [void]$stringBuilder.AppendLine($separator)
          [void]$stringBuilder.AppendLine("# FILE: $relativeFilePath")
          [void]$stringBuilder.AppendLine("# EXTENSION: $($file.Extension)")
          [void]$stringBuilder.AppendLine($separator)
          [void]$stringBuilder.AppendLine($fileContent)
          [void]$stringBuilder.AppendLine("`n")
        }
      }
      catch {
        # Add error info to string builder
        $separator = "=" * 80
        [void]$stringBuilder.AppendLine($separator)
        [void]$stringBuilder.AppendLine("# FILE: $relativeFilePath")
        [void]$stringBuilder.AppendLine("# ERROR: Could not read file content: $_")
        [void]$stringBuilder.AppendLine($separator)
        [void]$stringBuilder.AppendLine("`n")
      }
    }
    
    Write-Progress -Activity "Extracting source code" -Completed
    
    # Add summary at the end
    $separator = "=" * 80
    [void]$stringBuilder.AppendLine($separator)
    [void]$stringBuilder.AppendLine("# SUMMARY")
    [void]$stringBuilder.AppendLine("# Total files processed: $totalFiles")
    [void]$stringBuilder.AppendLine("# Extraction completed: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')")
    [void]$stringBuilder.AppendLine($separator)
    
    # Write everything to file at once
    [System.IO.File]::WriteAllText($OutputFile, $stringBuilder.ToString())
    
    return $OutputFile
  }
  
  function Get-FolderTree {
    param (
      [string]$Path = (Get-Location),
      [string]$Prefix = "",
      [string[]]$ExcludedDirectories = @('node_modules', '\.next', '\.venv', '\.git', 'dist', 'build'),
      [string[]]$IncludedExtensions = @('.js', '.jsx', '.ts', '.tsx', '.py', '.rb', '.c', '.cpp', '.h', '.hpp', '.cs', '.php', '.go', '.java', '.rs', '.md', '.txt')
    )
  
    # Build exclude pattern
    $excludePattern = $ExcludedDirectories -join '|'
    
    # Get subdirectories (excluding specified directories)
    $folders = Get-ChildItem -Path $Path -Directory |
               Where-Object { $_.FullName -notmatch $excludePattern } |
               Sort-Object Name
  
    # Get files with specified extensions (excluding specified directories)
    $files = Get-ChildItem -Path $Path -File |
             Where-Object { ($_.Extension -in $IncludedExtensions) -and ($_.FullName -notmatch $excludePattern) } |
             Sort-Object Name
  
    # Combine folders and files
    $items = @()
    $items += $folders
    $items += $files
    $count = $items.Count
  
    for ($i = 0; $i -lt $count; $i++) {
      $item = $items[$i]
      if ($i -eq $count - 1) {
        $connector = "+-- "
        $subPrefix = "    "
      } else {
        $connector = "|-- "
        $subPrefix = "|   "
      }
      
      # Output item name
      Write-Output "$Prefix$connector$($item.Name)"
      
      # If it's a directory, recursively get its tree
      if ($item.PSIsContainer) {
        Get-FolderTree -Path $item.FullName -Prefix ($Prefix + $subPrefix) -ExcludedDirectories $ExcludedDirectories -IncludedExtensions $IncludedExtensions
      }
      # If it's a file with a programmable extension, get its functions
      elseif ($item.Extension -in @('.js', '.jsx', '.ts', '.tsx', '.py', '.rb', '.c', '.cpp', '.h', '.hpp', '.cs', '.php', '.go', '.java', '.rs')) {
        $functions = Get-FunctionDefinitions -FilePath $item.FullName
        if ($functions.Count -gt 0) {
          foreach ($function in $functions) {
            if ($function.StartsWith("module:")) {
              Write-Output "$Prefix$subPrefix|-- $function"
            }
            elseif ($function.StartsWith("class:")) {
              Write-Output "$Prefix$subPrefix|-- $function"
            }
            elseif ($function.StartsWith("component:")) {
              Write-Output "$Prefix$subPrefix|-- $function"
            }
            elseif ($function.StartsWith("function:")) {
              $function = $function -replace "function:", ""
              Write-Output "$Prefix$subPrefix|-- fn: $function"
            }
            elseif ($function.StartsWith("arrow:")) {
              $function = $function -replace "arrow:", ""
              Write-Output "$Prefix$subPrefix|-- fn: $function"
            }
            elseif ($function.StartsWith("method:")) {
              $function = $function -replace "method:", ""
              Write-Output "$Prefix$subPrefix|-- method: $function"
            }
            else {
              Write-Output "$Prefix$subPrefix|-- fn: $function"
            }
          }
        }
      }
    }
  }

# Main script execution
$scriptPath = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
if ($scriptPath -eq "") {
    $scriptPath = Get-Location
}

# Set default paths
$sourceCodeOutputFile = Join-Path -Path $scriptPath -ChildPath "all_source_code.txt"
$treeOutputFile = Join-Path -Path $scriptPath -ChildPath "tree_structure.txt"

# Generate tree structure first and save to its own file
Write-Host "Generating folder tree with detailed function information..." -ForegroundColor Cyan
Get-FolderTree | Out-File $treeOutputFile
Write-Host "Tree structure with detailed function information has been saved to: $treeOutputFile" -ForegroundColor Green

# Generate source code extraction (includes tree at the top)
Write-Host "Extracting all source code from project files..." -ForegroundColor Cyan
Get-SourceCodeExtract -OutputFile $sourceCodeOutputFile
Write-Host "Source code has been extracted to: $sourceCodeOutputFile" -ForegroundColor Green

# Get file size of the output file
$fileSize = (Get-Item -Path $sourceCodeOutputFile).Length / 1MB
Write-Host "Output file size: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Yellow

# Ask if user wants to view the first few lines of the output file
$viewFile = Read-Host "Do you want to view the first few lines of the output file? (Y/N)"
if ($viewFile -eq "Y" -or $viewFile -eq "y") {
    Get-Content -Path $sourceCodeOutputFile -TotalCount 30
}