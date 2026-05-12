const fs = require('fs')
const path = require('path')

console.log('🚀 开始修复 JSON 格式问题...\n')

const filePath = 'd:/work/frontend/src/config/ai-rules.json'

// 读取文件
let content = fs.readFileSync(filePath, 'utf8')
console.log(`📄 读取文件成功，大小: ${(content.length / 1024).toFixed(1)} KB`)

// 统计单引号数量
const singleQuoteCount = (content.match(/'/g) || []).length
console.log(`⚠️  发现 ${singleQuoteCount} 个单引号字符`)

// 替换策略：
// 1. 中文内容中的单引号（如 '通州'）→ 使用中文引号「」或者直接删除
// 2. 英文缩写中的单引号（如 don't）→ 保留但转义

// 方法：将所有 'xxx' 模式替换为 "xxx" （中文引号变英文引号）
let fixedContent = content

// 替换被单引号包围的中文/文本
fixedContent = fixedContent.replace(/'([^']+)'/g, (match, text) => {
  // 如果是中文或常见词汇，用双引号包裹
  if (/[\u4e00-\u9fa5]/.test(text) || text.length > 1) {
    return `"${text}"`
  }
  return match
})

// 再次检查是否还有未处理的单引号
const remainingQuotes = (fixedContent.match(/'/g) || []).length
if (remainingQuotes > 0) {
  console.log(`⚠️  还有 ${remainingQuotes} 个单引号需要处理`)
  
  // 将剩余的单引号替换为转义版本或删除
  fixedContent = fixedContent.replace(/'/g, "\\'")
}

console.log(`✅ 已处理所有单引号`)

try {
  // 尝试解析
  console.log('\n1️⃣ 验证 JSON 格式...')
  const data = JSON.parse(fixedContent)
  console.log('✅ JSON 解析成功！')
  
  // 格式化为多行
  console.log('\n2️⃣ 格式化为多行...')
  const formatted = JSON.stringify(data, null, 2)
  
  // 写回文件
  fs.writeFileSync(filePath, formatted, 'utf8')
  console.log('✅ 文件写入成功！')
  
  // 统计信息
  const lines = formatted.split('\n')
  const fileSize = (fs.statSync(filePath).size / 1024).toFixed(1)
  
  console.log('\n3️⃣ 格式化结果:')
  console.log('─'.repeat(50))
  console.log(`   📄 总行数: ${lines.length}`)
  console.log(`   📊 文件大小: ${fileSize} KB`)
  console.log('─'.repeat(50))
  
  // 显示前15行和后5行
  console.log('\n📝 前15行预览:')
  lines.slice(0, 15).forEach((line, i) => {
    console.log(`${String(i + 1).padStart(3)}| ${line}`)
  })
  if (lines.length > 20) {
    console.log('   ...')
    lines.slice(-5).forEach((line, i) => {
      console.log(`${String(lines.length - 4 + i).padStart(3)}| ${line}`)
    })
  }
  
  console.log('\n🎉 完成！JSON已格式化为易读的多行格式')
  
} catch (error) {
  console.log('\n❌ 解析失败:', error.message.substring(0, 200))
  
  // 显示错误位置附近的内容
  const errorPos = parseInt(error.message.match(/position (\d+)/)?.[1] || '0')
  if (errorPos > 0) {
    const start = Math.max(0, errorPos - 50)
    const end = Math.min(fixedContent.length, errorPos + 50)
    console.log(`\n📍 错误位置附近内容:`)
    console.log(fixedContent.substring(start, end))
    console.log(' '.repeat(errorPos - start) + '^ 这里出错')
  }
}
