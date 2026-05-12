/**
 * 格式化 ai-rules.json 为多行可读格式
 * 运行方式：在项目根目录执行: node scripts/format-json.cjs
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/config/ai-rules.json');

console.log('📄 读取文件...');
const content = fs.readFileSync(filePath, 'utf8');

console.log('🔧 解析JSON...');
const data = JSON.parse(content);

console.log('✨ 格式化为多行...');
const formatted = JSON.stringify(data, null, 2);

console.log('💾 写入文件...');
fs.writeFileSync(filePath, formatted, 'utf8');

const lines = formatted.split('\n');
console.log('\n✅ 完成！');
console.log(`📊 总行数: ${lines.length}`);
console.log(`📁 文件: ${filePath}`);

console.log('\n📝 前20行预览:');
console.log('─'.repeat(60));
lines.slice(0, 20).forEach((line, i) => {
  console.log(`${String(i + 1).padStart(3)}| ${line}`);
});
if (lines.length > 20) {
  console.log('   ...');
}
console.log('─'.repeat(60));
