const fs = require('fs')

console.log('🔧 开始格式化 JSON 文件...\n')

const filePath = 'd:/work/frontend/src/config/ai-rules.json'

// 读取文件
let content = fs.readFileSync(filePath, 'utf8')
console.log(`📄 读取成功: ${(content.length / 1024).toFixed(1)} KB`)

try {
  // 解析JSON
  console.log('\n1️⃣  解析 JSON...')
  const data = JSON.parse(content)
  console.log('   ✅ 解析成功！')
  
  // 格式化为多行（2空格缩进）
  console.log('\n2️⃣  格式化为多行（2空格缩进）...')
  const formatted = JSON.stringify(data, null, 2)
  
  // 写回文件
  fs.writeFileSync(filePath, formatted, 'utf8')
  console.log('   ✅ 写入成功！')
  
  // 统计信息
  const lines = formatted.split('\n')
  const fileSizeKB = (fs.statSync(filePath).size / 1024).toFixed(1)
  
  console.log('\n3️⃣  格式化结果:')
  console.log('─'.repeat(60))
  console.log(`   📄 总行数: ${lines.length}`)
  console.log(`   📊 文件大小: ${fileSizeKB} KB`)
  console.log('─'.repeat(60))
  
  // 显示前20行
  console.log('\n📝 前20行预览:')
  lines.slice(0, 20).forEach((line, i) => {
    console.log(`${String(i + 1).padStart(3)}| ${line}`)
  })
  
  if (lines.length > 20) {
    console.log(`   ... 还有 ${lines.length - 20} 行`)
  }
  
  console.log('\n' + '─'.repeat(60))
  console.log('🎉 完成！JSON已成功格式化为多行可读格式\n')
  
} catch (error) {
  console.log('\n❌ 错误:', error.message)
}
