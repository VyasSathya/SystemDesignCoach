function Get-FolderTree {
    param (
      [string]$Path = (Get-Location),
      [string]$Prefix = ""
    )
  
    # Get subdirectories (excluding node_modules, .next, and .venv)
    $folders = Get-ChildItem -Path $Path -Directory |
               Where-Object { $_.FullName -notmatch 'node_modules|\.next|\.venv' } |
               Sort-Object Name
  
    # Get files with .js, .md, or .txt extension (excluding node_modules, .next, and .venv)
    $files = Get-ChildItem -Path $Path -File |
             Where-Object { ($_.Extension -eq ".js" -or $_.Extension -eq ".md" -or $_.Extension -eq ".txt") -and ($_.FullName -notmatch 'node_modules|\.next|\.venv') } |
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
      Write-Output "$Prefix$connector$($item.Name)"
      if ($item.PSIsContainer) {
        Get-FolderTree -Path $item.FullName -Prefix ($Prefix + $subPrefix)
      }
    }
  }
  
  # Overwrite tree_structure.txt each time
  Get-FolderTree | Out-File tree_structure.txt
  
  # Display the file contents
  Get-Content tree_structure.txt
  