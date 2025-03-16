# AI Model Integration - Code Flow Guide

## System Entry Points

1. Model Selection:
```
/server/services/ai/modelSelector.js:selectModel()
↓
/server/services/ai/modelRegistry.js:getModel()
↓
/server/services/ai/capabilityChecker.js:checkCapabilities()
↓
/server/services/ai/modelInitializer.js:initializeModel()
```

2. Request Processing:
```
/server/services/ai/requestProcessor.js:processRequest()
↓
/server/services/ai/tokenManager.js:manageTokens()
↓
/server/services/ai/rateLimiter.js:checkLimits()
↓
/server/services/ai/requestQueue.js:queueRequest()
```

## Core Data Flow Patterns

### 1. Model Switching:
```
/server/services/ai/modelSwitcher.js:switchModel()
↓
/server/services/ai/stateTransfer.js:transferState()
↓
/server/services/ai/contextMigration.js:migrateContext()
↓
/server/services/ai/configAdapter.js:adaptConfig()
```

### 2. Fallback Handling:
```
/server/services/ai/fallbackManager.js:manageFallback()
↓
/server/services/ai/errorDetector.js:detectError()
↓
/server/services/ai/alternativeSelector.js:selectAlternative()
↓
/server/services/ai/recoveryHandler.js:handleRecovery()
```