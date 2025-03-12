// server/services/engines/graderEngine.js
const BaseEngine = require('./baseEngine');
const Interview = require('../../models/Interview');
const Problem = require('../../models/Problem');
const Evaluation = require('../../models/Evaluation');
const fs = require('fs');
const path = require('path');

class GraderEngine extends BaseEngine {
  constructor(config = {}) {
    super(config);
    this.name = 'grader';
    
    // Try to load grader prompt from file
    try {
      const graderPromptPath = path.join(__dirname, '../../data/persona/grader.js');
      if (fs.existsSync(graderPromptPath)) {
        this.graderPrompt = require(graderPromptPath);
      } else {
        console.log('Grader prompt file not found, using default prompt');
        this.graderPrompt = this._getDefaultGraderPrompt;
      }
    } catch (error) {
      console.error('Error loading grader prompt:', error);
      this.graderPrompt = this._getDefaultGraderPrompt;
    }
  }
  
  /**
   * Evaluate a workbook submission
   * @param {string} sessionId - The session ID
   * @param {object} workbookContent - The content of the workbook
   * @param {object} options - Additional options
   * @returns {object} Evaluation results
   */
  async evaluateWorkbook(sessionId, workbookContent, options = {}) {
    try {
      // Find the session
      const session = await Interview.findById(sessionId).populate('problemId');
      
      if (!session) {
        throw new Error(`Session not found: ${sessionId}`);
      }
      
      // Extract problem and user information
      const problem = session.problemId;
      const userLevel = options.userLevel || 'mid-level';
      
      // Get system prompt for grader
      const systemPrompt = this._buildGraderPrompt({
        userLevel,
        problemId: problem?.id,
        evaluationType: session.type || 'coaching',
        conciseMode: options.conciseMode !== false // Default to concise mode
      });

      // Create prompt for evaluation
      const prompt = `Evaluate this system design for ${problem?.title || 'the given problem'}:

${JSON.stringify(workbookContent, null, 2)}

Provide a concise, focused evaluation following the framework in your instructions.`;

      // Generate evaluation using AI service
      const evaluationContent = await this.aiService.sendMessage([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ], { 
        temperature: 0.3 // Lower temperature for more consistent evaluations
      });

      // Parse scores and create evaluation record
      const scores = this._extractScores(evaluationContent);
      
      // Create or update evaluation record
      let evaluation = await Evaluation.findOne({ sessionId });
      
      if (!evaluation) {
        evaluation = new Evaluation({
          sessionId,
          evaluationType: session.type === 'interview' ? 'interview' : 'coaching',
          userLevel,
          problemId: problem?.id,
          content: evaluationContent,
          scores,
          timestamp: new Date()
        });
      } else {
        evaluation.content = evaluationContent;
        evaluation.scores = scores;
        evaluation.userLevel = userLevel;
        evaluation.timestamp = new Date();
      }
      
      await evaluation.save();
      
      return {
        evaluation: evaluationContent,
        scores
      };
    } catch (error) {
      console.error('Error in evaluateWorkbook:', error);
      throw error;
    }
  }

  /**
   * Extract numerical scores from evaluation text
   * @private
   * @param {string} evaluationText - The evaluation text to parse
   * @returns {object} Extracted scores
   */
  _extractScores(evaluationText) {
    const scores = {};
    const scorePattern = /([A-Za-z\s&]+)\s*\((\d+)\/(\d+)\)/g;
    let match;
    
    while ((match = scorePattern.exec(evaluationText)) !== null) {
      const category = match[1].trim();
      const score = parseInt(match[2], 10);
      const maxScore = parseInt(match[3], 10);
      scores[category] = { score, maxScore };
    }
    
    // Extract overall score if present
    const overallMatch = /Overall Score:\s*(\d+)\/(\d+)/i.exec(evaluationText);
    if (overallMatch) {
      scores.overall = { 
        score: parseInt(overallMatch[1], 10), 
        maxScore: parseInt(overallMatch[2], 10) 
      };
    }
    
    return scores;
  }
  
  /**
   * Provide final assessment for an interview
   * @param {string} interviewId - The interview ID
   * @param {object} options - Additional options
   * @returns {object} Assessment results
   */
  async provideFinalAssessment(interviewId, options = {}) {
    try {
      const interview = await Interview.findById(interviewId).populate('problemId');
      
      if (!interview) {
        throw new Error(`Interview not found: ${interviewId}`);
      }
      
      // Extract necessary information
      const userLevel = options.userLevel || 'mid-level';
      const conversationText = interview.conversation
        .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
        .join('\n\n');
      
      // Build grader system prompt
      const systemPrompt = this._buildGraderPrompt({
        userLevel,
        problemId: interview.problemId?.id,
        evaluationType: 'interview',
        isFinal: true,
        conciseMode: options.conciseMode !== false // Default to concise mode
      });
      
      const prompt = `Provide a comprehensive assessment of this completed system design interview for ${interview.problemId?.title || 'a system design problem'}.

Interview conversation:
${conversationText}

Focus on evaluating their system design skills based on this interview.`;
      
      const assessment = await this.aiService.sendMessage([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ], { temperature: 0.3 });
      
      // Parse and store evaluation
      const scores = this._extractScores(assessment);
      
      // Create evaluation record
      const evaluation = new Evaluation({
        sessionId: interviewId,
        evaluationType: 'interview',
        userLevel,
        problemId: interview.problemId?.id,
        content: assessment,
        scores,
        timestamp: new Date(),
        isFinal: true
      });
      
      await evaluation.save();
      
      return {
        assessment,
        scores
      };
    } catch (error) {
      console.error('Error in provideFinalAssessment:', error);
      throw error;
    }
  }
  
  /**
   * Build the grader prompt with the appropriate context
   * @private
   * @param {object} context - Context for the prompt
   * @returns {string} The formatted grader prompt
   */
  _buildGraderPrompt(context) {
    // If we have a grader prompt function, use it
    if (typeof this.graderPrompt === 'function') {
      return this.graderPrompt(context);
    }
    
    // Otherwise use the default
    return this._getDefaultGraderPrompt(context);
  }
  
  /**
   * Get the default grader prompt
   * @private
   * @param {object} context - Context for the prompt
   * @returns {string} Default grader prompt
   */
  _getDefaultGraderPrompt(context = {}) {
    const { userLevel = 'mid-level', evaluationType = 'coaching', isFinal = false, conciseMode = true } = context;
    
    let prompt = `# SYSTEM DESIGN GRADER PERSONA

## ROLE DEFINITION
You are a System Design Grader responsible for objectively evaluating system design solutions. You provide structured, comprehensive feedback based on established criteria while maintaining a neutral, analytical tone.

## USER EXPERIENCE LEVEL ASSESSMENT
The user has identified themselves as: ${userLevel}
Tailor your expectations and feedback depth according to this level.

## EVALUATION FRAMEWORK
Assess designs across these key dimensions (100 points total):
1. Requirements Analysis (0-15 points)
2. System Interface Design (0-10 points)
3. Capacity Estimation (0-10 points)
4. Data Modeling (0-15 points)
5. High-Level Architecture (0-15 points)
6. Detailed Component Design (0-15 points)
7. Scalability & Performance (0-10 points)
8. Reliability & Fault Tolerance (0-10 points)

## FEEDBACK FORMAT
1. Summary Assessment
   - User's experience level
   - Overall score
   - 1-2 sentence summary of strongest and weakest areas

2. Dimensional Breakdown
   - Score for each dimension
   - 1-2 bullet points for strengths
   - 1-2 bullet points for improvements

3. Prioritized Improvement Plan
   - 3 highest priority improvements ranked by importance
   - One-sentence explanation for each

## SCORING GUIDELINES BY LEVEL`;

    // Add level-specific guidelines
    if (userLevel === 'junior') {
      prompt += `
- Junior Level: 60-70 points meets expectations
- Key focus: Functional correctness, basic component understanding`;
    } else if (userLevel === 'mid-level') {
      prompt += `
- Mid-Level: 70-80 points meets expectations
- Key focus: Scalability, component interactions, basic trade-offs`;
    } else if (userLevel === 'senior') {
      prompt += `
- Senior Level: 80-90 points meets expectations
- Key focus: Comprehensive design, performance optimization, fault tolerance`;
    } else {
      prompt += `
- Staff+: 90-100 points meets expectations
- Key focus: System-wide optimization, elegant design patterns, forward-thinking architecture`;
    }

    // Add concise mode instructions
    if (conciseMode) {
      prompt += `

## COMMUNICATION STYLE
Be direct and focused in your evaluation:
- Use short paragraphs (2-3 sentences maximum)
- Prefer bullet points for feedback items
- Avoid explaining basic concepts
- Focus on actionable insights rather than theory
- Eliminate filler words and redundant phrases
- Format scores consistently and clearly
- Make improvement suggestions specific and concrete`;
    }

    // Add any evaluation-type specific instructions
    if (evaluationType === 'interview' && isFinal) {
      prompt += `

## INTERVIEW ASSESSMENT FOCUS
When evaluating an interview:
- Consider the candidate's thought process
- Assess how they handled probing questions
- Evaluate their communication clarity
- Consider their ability to defend design choices
- Note how they handled feedback during the interview`;
    }
    
    return prompt;
  }
}

module.exports = new GraderEngine();