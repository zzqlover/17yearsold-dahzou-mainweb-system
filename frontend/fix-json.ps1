# 读取JSON文件
$filePath = "d:\work\frontend\src\config\ai-rules.json"
$content = Get-Content $filePath -Raw -Encoding UTF8

Write-Host "📄 原始文件大小: $($content.Length / 1024) KB" -ForegroundColor Cyan
Write-Host "⚠️  检测到单引号问题，开始修复..." -ForegroundColor Yellow

# 替换单引号为中文引号或双引号
$fixedContent = $content -replace "'([^']+)'", '"$1"'
$fixedContent = $fixedContent -replace "'", "`'"

# 转换为JSON对象再格式化
try {
    $jsonObject = $fixedContent | ConvertFrom-Json
    $formattedJson = $jsonObject | ConvertTo-Json -Depth 10
    
    # 写回文件
    Set-Content -Path $filePath -Value $formattedJson -Encoding UTF8
    
    $finalContent = Get-Content $filePath -Raw
    $lineCount = (Get-Content $filePath).Count
    $fileSize = (Get-Item $filePath).Length / 1024
    
    Write-Host "`n✅ JSON格式化成功！" -ForegroundColor Green
    Write-Host "📄 总行数: $lineCount" -ForegroundColor White
    Write-Host "📊 文件大小: $([math]::Round($fileSize, 1)) KB" -ForegroundColor White
    
    Write-Host "`n📝 前20行预览:" -ForegroundColor Cyan
    Write-Host "─" * 60 -ForegroundColor DarkGray
    
    $lines = Get-Content $filePath | Select-Object -First 20
    for ($i = 0; $i -lt $lines.Count; $i++) {
        Write-Host "$($i + 1.ToString().PadLeft(3))| $($lines[$i])" -ForegroundColor White
    }
    
    if ($lineCount -gt 20) {
        Write-Host "   ... 还有 $($lineCount - 20) 行" -ForegroundColor Gray
    }
    
    Write-Host "─" * 60 -ForegroundColor DarkGray
    Write-Host "`n🎉 完成！JSON已格式化为易读的多行格式" -ForegroundColor Green
    
} catch {
    Write-Host "`n❌ 错误: $_" -ForegroundColor Red
}
