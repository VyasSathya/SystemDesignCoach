# Persona System - Code Flow Guide

## System Entry Points

1. Persona Initialization:
```
/server/routes/api/persona.js:handlePersonaInitialization()
↓
/server/services/persona/personaService.js:initializePersona(type)
↓
/server/services/persona/personaFactory.js:createPersona()
↓
/server/services/persona/personaInitializer.js:setupPersona()
```

2. Persona Switching:
```
/server/routes/api/persona.js:handlePersonaSwitch()
↓
/server/services/persona/switchManager.js:switchPersona(sessionId, newPersona)
↓
/server/services/persona/contextManager.js:transferContext()
↓
/server/services/persona/stateManager.js:updateState()
```

## Core Data Flow Patterns

### 1. Persona Management:
```
/server/services/persona/personaManager.js:managePersona()
↓
/server/services/persona/roleHandler.js:processRole()
↓
/server/services/persona/behaviorManager.js:manageBehavior()
↓
/server/services/persona/stateManager.js:updateState()
```

### 2. Context Handling:
```
/server/services/persona/contextManager.js:handleContext()
↓
/server/services/persona/memoryManager.js:processMemory()
↓
/server/services/persona/historyTracker.js:trackHistory()
↓
/server/services/persona/contextUpdater.js:updateContext()
```

### 3. Response Generation:
```
/server/services/persona/responseGenerator.js:generateResponse()
↓
/server/services/persona/promptBuilder.js:buildPrompt()
↓
/server/services/persona/styleAdapter.js:adaptStyle()
↓
/server/services/persona/responseFormatter.js:formatResponse()
```

## Integration Points

### 1. AI Integration:
```
/server/services/persona/aiService.js:processWithAI()
↓
/server/services/ai/modelClients/personaClient.js:generateResponse()
↓
/server/services/persona/responseProcessor.js:processAIResponse()
↓
/server/services/persona/behaviorAdjuster.js:adjustBehavior()
```

### 2. Session Integration:
```
/server/services/persona/sessionManager.js:manageSession()
↓
/server/services/session/sessionHandler.js:handleSession()
↓
/server/services/persona/stateSync.js:syncState()
↓
/server/services/session/sessionStorage.js:updateSession()
```

## Error Handling

### 1. Persona Errors:
```
/server/services/persona/errorHandler.js:handlePersonaError()
↓
/server/services/persona/validation/personaValidator.js:validatePersona()
↓
/server/services/persona/errorFormatter.js:formatError()
↓
/server/services/persona/responseHandler.js:sendError()
```

### 2. Context Errors:
```
/server/services/persona/contextErrorHandler.js:handleContextError()
↓
/server/services/persona/recovery/contextRecovery.js:recoverContext()
↓
/server/services/persona/backup/backupManager.js:restoreBackup()
↓
/server/services/persona/notificationService.js:notifySystem()
```

## Monitoring and Analytics

### 1. Persona Performance:
```
/server/services/monitoring/personaMonitor.js:monitorPerformance()
↓
/server/services/monitoring/behaviorTracker.js:trackBehavior()
↓
/server/services/monitoring/metricCollector.js:collectMetrics()
↓
/server/services/monitoring/performanceAnalyzer.js:analyzePerformance()
```

### 2. Interaction Analytics:
```
/server/services/analytics/interactionAnalytics.js:trackInteractions()
↓
/server/services/analytics/behaviorAnalytics.js:analyzeBehavior()
↓
/server/services/analytics/patternDetector.js:detectPatterns()
↓
/server/services/analytics/insightGenerator.js:generateInsights()
```

### 3. Quality Assurance:
```
/server/services/qa/personaQA.js:checkQuality()
↓
/server/services/qa/responseValidator.js:validateResponses()
↓
/server/services/qa/consistencyChecker.js:checkConsistency()
↓
/server/services/qa/reportGenerator.js:generateQAReport()
```