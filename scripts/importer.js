/**
 * 科目四题库导入工具
 * 使用方法: node scripts/importer.js path/to/your/data.json
 * 
 * 预期 JSON 格式样例:
 * [
 *   {
 *     "title": "题目内容...",
 *     "options": ["A.选项1", "B.选项2", ...],
 *     "answer": "A",
 *     "explanation": "解析内容..."
 *   }
 * ]
 */

import fs from 'fs';
import path from 'path';

const inputFile = process.argv[2];
const outputFile = path.join(process.cwd(), 'public/questions.json');

if (!inputFile) {
  console.error('请提供输入 JSON 文件路径: node scripts/importer.js data.json');
  process.exit(1);
}

try {
  const rawData = fs.readFileSync(inputFile, 'utf8');
  const jsonData = JSON.parse(rawData);

  // 读取现有文件内容
  let currentQuestions = [];
  if (fs.existsSync(outputFile)) {
    currentQuestions = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
  }
  
  const lastId = currentQuestions.length > 0 ? Math.max(...currentQuestions.map(q => q.id)) : 0;

  // 转换逻辑：根据实际抓取的数据结构进行调整
  const formattedQuestions = jsonData.map((item, index) => {
    // 自动判断题型
    let type = 'single';
    if (Array.isArray(item.answer) || (typeof item.answer === 'string' && item.answer.length > 1 && !['正确', '错误'].includes(item.answer))) {
      type = 'multiple';
    } else if (item.answer === '正确' || item.answer === '错误' || !item.options || item.options.length === 0) {
      type = 'boolean';
    }

    return {
      id: lastId + 1 + index,
      type: type,
      question: item.title || item.question,
      options: item.options || [],
      answer: item.answer,
      explanation: item.explanation || '暂无解析',
      image: item.image || undefined
    };
  });

  const finalQuestions = [...currentQuestions, ...formattedQuestions];
  fs.writeFileSync(outputFile, JSON.stringify(finalQuestions, null, 2));
  console.log(`成功导入 ${formattedQuestions.length} 道题目！总题量现已达到 ${finalQuestions.length}。`);

} catch (error) {
  console.error('导入失败:', error.message);
}
