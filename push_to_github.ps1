param(
    [string]$Token = ""
)

$GitExe = "C:\Users\sshar\.gemini\antigravity\scratch\mingit\cmd\git.exe"
$RepoUrl = "github.com/gmsethupathi12/Personal-AI.git"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   LEVI.AI - PUSH TO GITHUB REPOSITORY                   " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan

if (-not $Token) {
    Write-Host "Target Repository: https://$RepoUrl" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "GitHub requires a Personal Access Token (PAT) to authenticate."
    Write-Host "Generate one here: https://github.com/settings/tokens"
    Write-Host "  -> Click 'Generate new token (classic)'"
    Write-Host "  -> Check the 'repo' scope box"
    Write-Host "  -> Click 'Generate token' and copy it"
    Write-Host ""
    $Token = Read-Host "Paste your GitHub Personal Access Token"
}

if ($Token) {
    Write-Host "Pushing commits and files to GitHub..." -ForegroundColor Cyan
    & $GitExe push "https://${Token}@${RepoUrl}" main
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "==========================================================" -ForegroundColor Green
        Write-Host "✓ PUSH SUCCESSFUL!" -ForegroundColor Green
        Write-Host "Visit your repository: https://github.com/gmsethupathi12/Personal-AI" -ForegroundColor Cyan
        Write-Host "==========================================================" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "✗ Push failed. Please verify your token permissions (requires 'repo' scope)." -ForegroundColor Red
    }
} else {
    Write-Host "No token provided. Push aborted." -ForegroundColor Red
}
