const logMessageProcessing = (sessionId, message, systemPrompt, projectDetails) => {
  // Create a formatted system prompt display
  const formatSystemPrompt = (prompt) => {
    const sections = prompt.split('\n\n');
    return sections.map(section => {
      const lines = section.trim().split('\n');
      return lines.join('\n  ');
    }).join('\n\n  ');
  };

  console.log(`
📝 Message Processing [${sessionId}]
────────────────────────────────────
🔹 User Message: "${message}"

🤖 System Prompt:
  ${formatSystemPrompt(systemPrompt)}

📋 Project Context:
  ${JSON.stringify(projectDetails, null, 2)}
────────────────────────────────────`);
};

module.exports = {
  logMessageProcessing
};
