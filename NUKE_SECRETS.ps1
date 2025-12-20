Write-Host "Starting secret cleanup"

Get-ChildItem -Recurse -File | ForEach-Object {

    $path = $_.FullName
    $content = Get-Content -Path $path -Raw

    $changed = $false

    if ($content -match "sk-") {
        $content = $content -replace "sk-[A-Za-z0-9]+", "REMOVED"
        $changed = $true
    }

    if ($content -match "AC") {
        $content = $content -replace "AC[A-Za-z0-9]{10,}", "REMOVED"
        $changed = $true
    }

    if ($content -match "whsec_") {
        $content = $content -replace "whsec_[A-Za-z0-9]+", "REMOVED"
        $changed = $true
    }

    if ($content -match "OPENAI_KEY=REPLACE_ME
        $content = $content -replace "OPENAI_KEY=REPLACE_ME
        $changed = $true
    }

    if ($content -match "STRIPE") {
        $content = $content -replace "STRIPE_KEY=REPLACE_ME
        $changed = $true
    }

    if ($content -match "TWILIO") {
        $content = $content -replace "TWILIO_KEY=REPLACE_ME
        $changed = $true
    }

    if ($content -match "ANTHROPIC") {
        $content = $content -replace "ANTHROPIC_KEY=REPLACE_ME
        $changed = $true
    }

    if ($changed) {
        Set-Content -Path $path -Value $content -Encoding ASCII
        Write-Host "Cleaned:" $path
    }
}

Write-Host "Cleanup finished"

