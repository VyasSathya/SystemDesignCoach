const logMessageProcessing = (sessionId, message, systemPrompt, projectDetails) => {
  console.log('\n=== Message Processing Start ===');
  console.log(`SessionID: ${sessionId}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  
  console.log('\n--- User Message ---');
  console.log(message);
  
  console.log('\n--- System Prompt ---');
  // Split long text into readable chunks
  const promptLines = systemPrompt.split('\n');
  promptLines.forEach(line => console.log(line));
  
  console.log('\n--- Project Details ---');
  console.log(JSON.stringify(projectDetails, null, 2));
  
  console.log('=== Message Processing End ===\n');
};

const processMessage = async (sessionId, message, contextInfo = null) => {
  try {
    logMessageProcessing(sessionId, message, systemPrompt, contextInfo);
    
    const response = await aiService.processMessage(
      sessionId,
      message,
      systemPrompt,
      contextInfo
    );
    
    console.log('\n--- AI Response ---');
    console.log(JSON.stringify(response, null, 2));
    
    return response;
    
  } catch (error) {
    console.error('Error processing message:', error);
    throw error;
  }
};