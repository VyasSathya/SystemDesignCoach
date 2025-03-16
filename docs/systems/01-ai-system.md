# AI System (Nervous System)

## Processing User Messages and Generating AI Responses
```
/server/services/ai/aiService.js:sendMessage()
↓
/server/services/ai/promptBuilder.js:buildPrompt()
↓
/server/services/ai/responseHandler.js:processResponse()
```

## Switching Between Different AI Personalities Based on Context
```
/server/services/engines/baseEngine.js
↓
/server/services/engines/coachEngine.js
↓
/server/services/engines/interviewEngine.js
↓
/server/services/engines/graderEngine.js
```

## Analyzing Technical Components in System Designs
```
/server/services/ai/evaluator/patternDetector.js
↓
/server/services/ai/evaluator/componentAnalyzer.js
↓
/server/services/ai/evaluator/relationshipAnalyzer.js
```