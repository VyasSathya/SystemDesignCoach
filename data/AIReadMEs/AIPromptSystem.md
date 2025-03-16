# AI Prompt System - Code Flow Guide

## System Entry Points

1. Prompt Generation:
```
/server/services/ai/promptService.js:generatePrompt()
↓
/server/services/ai/promptBuilder.js:buildPrompt()
↓
/server/services/ai/templateManager.js:applyTemplate()
↓
/server/services/ai/contextInjector.js:injectContext()
```

2. Template Management:
```
/server/services/ai/templateService.js:manageTemplate()
↓
/server/services/ai/templateLoader.js:loadTemplate()
↓
/server/services/ai/templateValidator.js:validateTemplate()
↓
/server/services/ai/templateOptimizer.js:optimizeTemplate()
```

## Core Data Flow Patterns

### 1. Dynamic Prompt Construction:
```
/server/services/ai/promptConstructor.js:constructPrompt()
↓
/server/services/ai/variableResolver.js:resolveVariables()
↓
/server/services/ai/contextManager.js:mergeContext()
↓
/server/services/ai/promptFormatter.js:formatPrompt()
```

### 2. Context Window Management:
```
/server/services/ai/windowManager.js:manageWindow()
↓
/server/services/ai/tokenCounter.js:countTokens()
↓
/server/services/ai/contentPruner.js:pruneContent()
↓
/server/services/ai/windowOptimizer.js:optimizeWindow()
```

### 3. System Message Handling:
```
/server/services/ai/systemMessageHandler.js:handleSystemMessage()
↓
/server/services/ai/roleManager.js:defineRole()
↓
/server/services/ai/constraintManager.js:applyConstraints()
↓
/server/services/ai/behaviorGuide.js:guideBehavior()
```