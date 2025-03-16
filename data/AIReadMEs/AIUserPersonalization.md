# AI User Personalization - Code Flow Guide

## System Entry Points

1. User Profile Management:
```
/server/services/user/profileManager.js:manageProfile()
↓
/server/services/user/preferenceLearner.js:learnPreferences()
↓
/server/services/user/skillTracker.js:trackSkills()
↓
/server/services/user/experienceAnalyzer.js:analyzeExperience()
```

2. Adaptive Response:
```
/server/services/user/responseAdapter.js:adaptResponse()
↓
/server/services/user/complexityAdjuster.js:adjustComplexity()
↓
/server/services/user/styleCustomizer.js:customizeStyle()
↓
/server/services/user/feedbackCalibrator.js:calibrateFeedback()
```

## Core Data Flow Patterns

### 1. Learning Path:
```
/server/services/user/pathGenerator.js:generatePath()
↓
/server/services/user/progressTracker.js:trackProgress()
↓
/server/services/user/recommendationEngine.js:generateRecommendations()
↓
/server/services/user/pathOptimizer.js:optimizePath()
```

### 2. Interaction History:
```
/server/services/user/historyManager.js:manageHistory()
↓
/server/services/user/patternAnalyzer.js:analyzePatterns()
↓
/server/services/user/behaviorPredictor.js:predictBehavior()
↓
/server/services/user/interactionOptimizer.js:optimizeInteractions()
```