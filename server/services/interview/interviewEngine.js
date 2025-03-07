const { default: Anthropic } = require('@anthropic-ai/sdk');
const Interview = require('../../models/Interview');
const Problem = require('../../models/Problem');
const knowledgeService = require('../knowledge/knowledgeService'); // We'll create this

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const INTERVIEW_STAGES = [
  'intro', 'requirements', 'high-level-design', 
  'detailed-design', 'scaling', 'tradeoffs'
];

// Enhanced stage progression logic with more specific criteria
const _shouldAdvanceStage = (interview) => {
  // Get last interviewer and candidate messages
  const lastInterviewerMessages = interview.conversation
    .filter(msg => msg.role === 'interviewer')
    .slice(-2);
  
  const lastCandidateMessage = interview.conversation
    .filter(msg => msg.role === 'candidate')
    .pop();
  
  // Look for advancement indicators in interviewer messages
  const interviewerSuggestsAdvancement = lastInterviewerMessages.some(msg => 
    msg.content.includes("let's move on") || 
    msg.content.includes("good, now let's discuss") ||
    msg.content.includes("Let's shift our focus")
  );
  
  // Check if candidate response is substantial
  const substantialResponse = lastCandidateMessage && 
         lastCandidateMessage.content.split(' ').length > 50;
  
  return interviewerSuggestsAdvancement && substantialResponse;
};

const _extractKeyPoints = (text, section) => {
  const regex = new RegExp(`${section}:\\s*(.+?)(?:\\n\\n|$)`, 'is');
  const match = text.match(regex);
  return match ? match[1].split('\n').map(p => p.trim()).filter(p => p) : [];
};

const interviewEngine = {
  startInterview: async (userId, problemId) => {
    try {
      const problem = await Problem.findOne({ id: problemId });
      if (!problem) {
        throw new Error('Problem not found');
      }
      
      // Get Facebook-specific context for this problem
      const fbContext = await knowledgeService.queryKnowledge(
        `Facebook system design interview for ${problem.title}`, 
        'facebook'
      );
      
      const response = await anthropic.messages.create({
        model: "claude-3-opus-20240229",
        system: `You are a Facebook system design interviewer with years of experience.
        
        Use this context about Facebook's interview style and relevant systems:
        ${fbContext}
        
        Start a system design interview for ${problem.title}. Begin with a clear problem statement and 
        initial open-ended question. Use a conversational tone like a real Facebook interviewer would.`,
        messages: [{
          role: "user", 
          content: `I'm here for my Facebook system design interview about ${problem.title}.`
        }],
        max_tokens: 500,
        temperature: 0.7
      });
      
      const interview = new Interview({
        userId,
        problemId,
        status: 'in_progress',
        currentStage: 'intro',
        conversation: [
          {
            role: 'interviewer',
            content: response.content[0].text
          }
        ]
      });
      
      await interview.save();
      return interview;
    } catch (error) {
      console.error('Interview start error:', error);
      throw error;
    }
  },
  
  processResponse: async (interviewId, message) => {
    try {
      const interview = await Interview.findById(interviewId);
      if (!interview) {
        throw new Error('Interview not found');
      }
      
      interview.conversation.push({
        role: 'candidate',
        content: message
      });
      
      const problem = await Problem.findOne({ id: interview.problemId });
      
      // Get relevant knowledge based on the candidate's message and current stage
      const relevantKnowledge = await knowledgeService.queryKnowledge(
        `${message} ${interview.currentStage} ${problem.title}`, 
        'facebook'
      );
      
      const formattedConversation = interview.conversation
        .filter(msg => msg.role !== 'system')
        .map(msg => ({
          role: msg.role === 'interviewer' ? 'assistant' : 'user',
          content: msg.content
        }));
      
      const stageContext = {
        'intro': 'Focus on understanding the problem scope and establishing requirements.',
        'requirements': 'Probe for both functional and non-functional requirements. Ask about scale, performance, reliability needs.',
        'high-level-design': 'Evaluate system components, data flow, and overall architecture approaches.',
        'detailed-design': 'Deep dive into specific components, APIs, database schema, and data models.',
        'scaling': 'Challenge on scaling bottlenecks, sharding strategies, and handling FB-scale traffic.',
        'tradeoffs': 'Discuss alternative approaches and have candidate justify their design choices.'
      };

      const response = await anthropic.messages.create({
        model: "claude-3-opus-20240229",
        system: `You are a Facebook system design interviewer evaluating a candidate on ${problem.title}.
        
        Current interview stage: ${interview.currentStage}
        Stage focus: ${stageContext[interview.currentStage]}
        
        Use this Facebook-specific knowledge to inform your response:
        ${relevantKnowledge}
        
        Your role is to:
        1. Ask probing questions that Facebook interviewers typically ask
        2. Challenge the candidate's assumptions in a collaborative way
        3. Guide them to consider Facebook-scale concerns
        4. Respond naturally as a Facebook interviewer would
        
        If the candidate has thoroughly addressed the current stage concerns, 
        consider moving to the next stage with a transitional question.`,
        messages: formattedConversation,
        max_tokens: 500,
        temperature: 0.7
      });

      interview.conversation.push({
        role: 'interviewer',
        content: response.content[0].text
      });
      
      const shouldAdvanceStage = _shouldAdvanceStage(interview);
      if (shouldAdvanceStage) {
        const currentStageIndex = INTERVIEW_STAGES.indexOf(interview.currentStage);
        if (currentStageIndex < INTERVIEW_STAGES.length - 1) {
          interview.currentStage = INTERVIEW_STAGES[currentStageIndex + 1];
        }
      }
      
      await interview.save();
      return interview;
    } catch (error) {
      console.error('Interview response error:', error);
      throw error;
    }
  },
  
  finalizeInterview: async (interview) => {
    try {
      const problem = await Problem.findOne({ id: interview.problemId });
      
      // Get Facebook-specific evaluation criteria
      const evaluationCriteria = await knowledgeService.queryKnowledge(
        `Facebook system design interview evaluation criteria for ${problem.title}`, 
        'facebook'
      );
      
      const response = await anthropic.messages.create({
        model: "claude-3-opus-20240229",
        system: `You are a Facebook system design interviewer conducting a final evaluation.
        
        Use these Facebook-specific evaluation criteria:
        ${evaluationCriteria}
        
        Provide a comprehensive evaluation that includes:
        1. Overall score (0-100)
        2. Key strengths (bullet points prefixed with "Strengths:")
        3. Areas for improvement (bullet points prefixed with "Weaknesses:")
        4. Specific recommendations (bullet points prefixed with "Areas to Improve:")
        5. Whether this candidate would likely pass Facebook's bar
        
        Be honest but constructive, matching Facebook's evaluation style.`,
        messages: interview.conversation.map(msg => ({
            role: msg.role === 'interviewer' ? 'assistant' : 'user',
            content: msg.content
          })),
        max_tokens: 1500, 
        temperature: 0.3
      });

      const evaluationText = response.content[0].text;
      
      const scoreMatch = evaluationText.match(/Score:\s*(\d+)/i);
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 50;
      
      interview.evaluation = {
        score,
        feedback: evaluationText,
        strengths: _extractKeyPoints(evaluationText, 'Strengths'),
        weaknesses: _extractKeyPoints(evaluationText, 'Weaknesses'),
        areas_to_improve: _extractKeyPoints(evaluationText, 'Areas to Improve') 
      };
      
      interview.status = 'completed';
      interview.completedAt = Date.now();
      
      await interview.save();
      return interview;
    } catch (error) {
      console.error('Interview finalization error:', error);
      throw error; 
    }
  }
};

module.exports = interviewEngine;