$dir = "$PSScriptRoot\marcas.index\"
Get-ChildItem -Path "$dir*.html" | ForEach-Object {
    $c = Get-Content $_.FullName -Raw
    # Case insensitive replace for the whole block
    # Handles both multi-line and single-line variants
    $p = '(?si)<a href="\.\./index\.html" class="logo">.*?<img src="\.\./images/logo-marcas/Triângulo-Logo\.webp".*?>(.*?)<img src="\.\./images/logo-marcas/Texto-logo_-_Editado-removebg-preview\.png".*?>.*?</a>'
    $n = '  <a href="../index.html" class="logo">`r`n    <img src="../images/logo-marcas/logo-alpe.png" alt="Logo ALPE" style="height: 60px;">`r`n  </a>'
    if ($c -match $p) {
        $c = $c -replace $p, $n
        Set-Content $_.FullName $c
        Write-Host "Updated: $($_.Name)"
    } else {
        Write-Host "No match in: $($_.Name)"
    }
}
