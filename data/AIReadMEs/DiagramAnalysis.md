# Diagram Analysis System - Code Flow Guide

## System Entry Points

1. Diagram Generation:
```
/server/routes/api/diagram.js:handleDiagramRequest()
↓
/server/services/ai/diagramService.js:generateDiagram(sessionId, type)
↓
/server/services/ai/promptBuilder.js:buildDiagramPrompt()
↓
/server/services/ai/diagramGenerator.js:createDiagram()
```

2. Diagram Evaluation:
```
/server/routes/api/evaluation.js:handleEvaluationRequest()
↓
/server/services/ai/diagramService.js:evaluateDiagram(diagram, sessionId)
↓
/server/services/ai/evaluator/patternDetector.js:analyzePatterns()
↓
/server/services/ai/evaluator/scoreCalculator.js:generateScore()
```

## Core Data Flow Patterns

### 1. Pattern Analysis:
```
/server/services/ai/evaluator/patternDetector.js:detectPatterns()
↓
/server/services/ai/evaluator/componentAnalyzer.js:analyzeComponents()
↓
/server/services/ai/evaluator/relationshipAnalyzer.js:analyzeRelationships()
↓
/server/services/ai/evaluator/patternMatcher.js:matchKnownPatterns()
↓
/server/services/ai/evaluator/resultAggregator.js:aggregateFindings()
```

### 2. Score Calculation:
```
/server/services/ai/evaluator/scoreCalculator.js:calculateScore()
↓
/server/services/ai/evaluator/criteriaEvaluator.js:evaluateCriteria()
↓
/server/services/ai/evaluator/weightCalculator.js:applyWeights()
↓
/server/services/ai/evaluator/scoreNormalizer.js:normalizeScores()
↓
/server/services/ai/evaluator/finalScoreGenerator.js:generateFinalScore()
```

### 3. Feedback Generation:
```
/server/services/ai/feedback/feedbackGenerator.js:generateFeedback()
↓
/server/services/ai/feedback/improvementAnalyzer.js:analyzeImprovements()
↓
/server/services/ai/feedback/recommendationEngine.js:generateRecommendations()
↓
/server/services/ai/feedback/feedbackFormatter.js:formatFeedback()
```

## Integration Points

### 1. AI Model Integration:
```
/server/services/ai/diagramService.js:processWithAI()
↓
/server/services/ai/modelClients/claudeClient.js:analyzeDiagram()
↓
/server/services/ai/responseProcessor.js:processDiagramAnalysis()
↓
/server/services/ai/resultFormatter.js:formatResults()
```

### 2. Database Integration:
```
/server/services/storage/diagramStorage.js:storeDiagram()
↓
/server/models/Diagram.js:save()
↓
/server/services/storage/evaluationStorage.js:storeEvaluation()
↓
/server/models/Evaluation.js:save()
```

## Error Handling

### 1. Diagram Processing Errors:
```
/server/services/ai/errorHandler.js:handleDiagramError()
↓
/server/services/ai/validation/diagramValidator.js:validateDiagram()
↓
/server/services/ai/errorFormatter.js:formatDiagramError()
↓
/server/services/ai/responseHandler.js:sendDiagramError()
```

### 2. Analysis Errors:
```
/server/services/ai/errorHandler.js:handleAnalysisError()
↓
/server/services/ai/validation/analysisValidator.js:validateAnalysis()
↓
/server/services/ai/errorFormatter.js:formatAnalysisError()
↓
/server/services/ai/responseHandler.js:sendAnalysisError()
```

## Monitoring and Metrics

### 1. Analysis Performance:
```
/server/services/monitoring/analysisMonitor.js:trackAnalysisMetrics()
↓
/server/services/monitoring/performanceTracker.js:trackPerformance()
↓
/server/services/monitoring/metricAggregator.js:aggregateMetrics()
↓
/server/services/monitoring/alertSystem.js:checkThresholds()
```

### 2. Quality Metrics:
```
/server/services/monitoring/qualityMonitor.js:trackQualityMetrics()
↓
/server/services/monitoring/accuracyTracker.js:trackAccuracy()
↓
/server/services/monitoring/consistencyChecker.js:checkConsistency()
↓
/server/services/monitoring/qualityReporter.js:generateReport()
```