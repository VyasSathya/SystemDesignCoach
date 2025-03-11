// server/routes/problems.js
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const problemsDir = path.join(__dirname, '../../data/problems');

function loadProblems() {
  let problems = [];
  try {
    const files = fs.readdirSync(problemsDir);
    files.forEach(file => {
      const ext = path.extname(file).toLowerCase();
      const filePath = path.join(problemsDir, file);
      if (ext === '.md') {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        let title = file.replace('.md', '');
        if (lines[0].startsWith('#')) {
          title = lines[0].replace('#', '').trim();
        }
        problems.push({
          id: file.replace('.md', ''),
          title,
          content,
          difficulty: 'medium'
        });
      } else if (ext === '.json') {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        problems.push(data);
      }
    });
    console.log(`Loaded ${problems.length} problems from ${problemsDir}.`);
  } catch (error) {
    console.error("Error reading problem files:", error);
  }
  return problems;
}

router.get('/', (req, res) => {
  const problems = loadProblems();
  if (problems.length === 0) {
    return res.status(404).json({ error: "No problems found" });
  }
  res.json(problems);
});

module.exports = router;
