const fs = require('fs')
const path = require('path')

console.log('🔧 开始修复和格式化 JSON 文件...\n')

// 读取原始文件
const filePath = path.join(__dirname, 'src/config/ai-rules.json')
let content = fs.readFileSync(filePath, 'utf8')

console.log(`📄 原始文件大小: ${(content.length / 1024).toFixed(1)} KB`)
console.log(`📊 原始行数: ${content.split('\n').length}`)

try {
  // 第一步：尝试解析（检查是否有错误）
  console.log('\n1️⃣ 检查 JSON 格式...')
  const data = JSON.parse(content)
  console.log('✅ JSON 格式正确！')
  
  // 第二步：格式化为多行（2空格缩进）
  console.log('\n2️⃣ 格式化为多行（2空格缩进）...')
  const formatted = JSON.stringify(data, null, 2)
  
  // 第三步：写回文件
  fs.writeFileSync(filePath, formatted, 'utf8')
  
  // 第四步：验证
  const finalContent = fs.readFileSync(filePath, 'utf8')
  const lines = finalContent.split('\n')
  
  console.log('\n3️⃣ 验证结果:')
  console.log(`   ✅ 格式化完成！`)
  console.log(`   📄 总行数: ${lines.length}`)
  console.log(`   📊 文件大小: ${(fs.statSync(filePath).size / 1024).toFixed(1)} KB`)
  
  // 显示前20行预览
  console.log('\n📝 前20行预览:')
  console.log('─'.repeat(60))
  lines.slice(0, 20).forEach((line, i) => {
    console.log(`${String(i + 1).padStart(3)}: ${line}`)
  })
  if (lines.length > 20) {
    console.log(`   ... 还有 ${lines.length - 20} 行`)
  }
  console.log('─'.repeat(60))
  
  console.log('\n🎉 JSON 文件已成功格式化为多行！')
  
} catch (error) {
  console.log('\n❌ JSON 解析错误:', error.message)
  console.log('\n🔍 尝试修复单引号问题...')
  
  // 如果有单引号问题，进行替换
  let fixedContent = content
  
  // 替换中文内容中的单引号为中文引号或直接删除
  fixedContent = fixedContent.replace(/'([^']+)'/g, '"$1"')  // 'text' → "text"
  fixedContent = fixedContent.replace(/'/g, "'")  // 单独的单引号 → 转义
  
  try {
    const data = JSON.parse(fixedContent)
    const formatted = JSON.stringify(data, null, 2)
    fs.writeFileSync(filePath, formatted, 'utf8')
    
    console.log('✅ 已自动修复并格式化成功！')
    
    const finalLines = formatted.split('\n')
    console.log(`📄 总行数: ${finalLines.length}`)
    console.log(`📊 文件大小: ${(fs.statSync(filePath).size / 1024).toFixed(1)} KB`)
    
  } catch (e2) {
    console.log('❌ 自动修复失败:', e2.message)
    console.log('\n💡 建议：手动检查并移除所有单引号字符')
  }
}
