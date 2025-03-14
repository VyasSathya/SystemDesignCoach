const logMessageProcessing = (sessionId, message, systemPrompt, projectDetails) => {
  console.log('\n🎯 === Message Processing Start ===');
  console.log(`🆔 SessionID: ${sessionId}`);
  console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
  console.log('\n📝 --- User Message ---');
  console.log(message);
  console.log('\n🤖 --- System Prompt ---');
  const promptLines = systemPrompt.split('\n');
  promptLines.forEach(line => console.log(line));
  console.log('\n📋 --- Project Details ---');
  console.log(JSON.stringify(projectDetails, null, 2));
  console.log('✨ === Message Processing End ===\n');
};

module.exports = {
  logMessageProcessing
};
