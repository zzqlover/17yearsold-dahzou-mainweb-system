const fs = require('fs');
const filePath = 'd:/work/frontend/src/config/ai-rules.json';

// 读取文件
const content = fs.readFileSync(filePath, 'utf8');
console.log('File size:', content.length, 'bytes');

// 检查是否是一行
const lineCount = content.split('\n').length;
console.log('Current line count:', lineCount);

// 解析JSON
try {
  const data = JSON.parse(content);
  console.log('Parse successful!');
  console.log('Keys:', Object.keys(data));
  console.log('Knowledge count:', data.knowledge?.length || 0);
  console.log('Rules count:', data.rules?.length || 0);
} catch(e) {
  console.log('Parse error:', e.message);
}