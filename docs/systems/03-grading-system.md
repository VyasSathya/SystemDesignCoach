# Grading System (Endocrine System)

## Analyzing and Scoring System Design Diagrams
```
/server/routes/api/evaluation.js:handleEvaluationRequest()
↓
/server/services/ai/diagramService.js:evaluateDiagram()
↓
/server/services/ai/evaluator/patternDetector.js:analyzePatterns()
↓
/server/services/ai/evaluator/scoreCalculator.js:generateScore()
```

## Calculating Weighted Scores Based on Design Criteria
```
/server/services/ai/evaluator/scoreCalculator.js:calculateScore()
↓
/server/services/ai/evaluator/criteriaEvaluator.js:evaluateCriteria()
↓
/server/services/ai/evaluator/weightCalculator.js:applyWeights()
↓
/server/services/ai/evaluator/scoreNormalizer.js:normalizeScores()
```

## Generating Detailed Improvement Suggestions
```
/server/services/ai/feedback/feedbackGenerator.js:generateFeedback()
↓
/server/services/ai/feedback/improvementAnalyzer.js:analyzeImprovements()
↓
/server/services/ai/feedback/recommendationEngine.js:generateRecommendations()
```