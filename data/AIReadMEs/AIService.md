# AI Service System - Code Flow Guide

## System Entry Points

1. Initial Service Creation:
```
/server/services/ai/aiFactory.js:create(type)
↓
/server/services/ai/aiService.js:constructor(config)
↓
/server/services/ai/aiService.js:_initializeClient()
↓
/server/services/ai/modelClients/clientManager.js:setupClient()
```

2. Message Processing:
```
/server/routes/ai.js:handleRequest()
↓
/server/services/ai/aiService.js:sendMessage()
↓
/server/services/ai/modelSelector.js:selectModel()
↓
/server/services/ai/responseHandler.js:generateResponse()
```

## Core Data Flow Patterns

### 1. Message Processing:
```
/server/services/ai/aiService.js:sendMessage(messages, options)
↓
/server/services/ai/validators/messageValidator.js:validateMessages()
↓
/server/services/ai/modelSelector.js:selectModel()
↓
/server/services/ai/messageHandler.js:sendModelMessage()
↓
/server/services/ai/responseProcessor.js:processResponse()
```

### 2. Context Management:
```
/server/services/ai/contextManager.js:generateResponse()
↓
/server/services/ai/promptBuilder.js:buildSystemPrompt()
↓
/server/services/ai/contextManager.js:appendContext()
↓
/server/services/ai/tokenizer.js:enforceTokenLimits()
↓
/server/services/ai/modelClients/baseClient.js:send()
```

### 3. Response Generation:
```
/server/services/ai/messageHandler.js:sendModelMessage()
↓
/server/services/ai/modelClients/claudeClient.js:generateResponse()
↓
/server/services/ai/streamHandler.js:handleResponseStream()
↓
/server/services/ai/validators/responseValidator.js:validateResponse()
↓
/server/services/ai/responseFormatter.js:formatResponse()
```

## Integration Points

### 1. Model Integration:
```
/server/services/ai/aiService.js:sendRequest()
↓
/server/services/ai/modelClients/clientManager.js:getClient()
↓
/server/services/ai/modelClients/baseClient.js:sendRequest()
↓
/server/services/ai/responseHandler.js:handleResponse()
```

### 2. System Integration:
```
/server/services/ai/integrationManager.js:processRequest()
↓
/server/services/ai/aiService.js:handleIntegration()
↓
/server/services/ai/dataProcessor.js:processResponse()
↓
/server/services/ai/responseFormatter.js:formatForSystem()
```

## Error Handling

### 1. Service Errors:
```
/server/services/ai/errorHandler.js:handleServiceError()
↓
/server/services/ai/logger.js:logError()
↓
/server/services/ai/errorFormatter.js:formatError()
↓
/server/services/ai/responseHandler.js:sendErrorResponse()
```

### 2. Model Errors:
```
/server/services/ai/modelClients/errorHandler.js:handleModelError()
↓
/server/services/ai/retryManager.js:handleRetry()
↓
/server/services/ai/fallbackHandler.js:switchModel()
↓
/server/services/ai/responseHandler.js:sendFallbackResponse()
```

## Monitoring and Logging

### 1. Performance Monitoring:
```
/server/services/ai/monitor/performanceMonitor.js:trackMetrics()
↓
/server/services/ai/monitor/metricCollector.js:collectMetrics()
↓
/server/services/ai/monitor/metricAnalyzer.js:analyzeMetrics()
↓
/server/services/ai/monitor/alertManager.js:checkThresholds()
```

### 2. Usage Logging:
```
/server/services/ai/logger/usageLogger.js:logUsage()
↓
/server/services/ai/logger/metricLogger.js:logMetrics()
↓
/server/services/ai/logger/storageManager.js:storeLog()
↓
/server/services/ai/logger/rotationManager.js:rotateLog()
```