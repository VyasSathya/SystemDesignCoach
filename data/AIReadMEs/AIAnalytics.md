# AI Analytics System - Code Flow Guide

## System Entry Points

1. Usage Analytics:
```
/server/services/analytics/usageTracker.js:trackUsage()
↓
/server/services/analytics/patternDetector.js:detectPatterns()
↓
/server/services/analytics/trendAnalyzer.js:analyzeTrends()
↓
/server/services/analytics/insightGenerator.js:generateInsights()
```

2. Performance Metrics:
```
/server/services/analytics/performanceTracker.js:trackPerformance()
↓
/server/services/analytics/metricAggregator.js:aggregateMetrics()
↓
/server/services/analytics/benchmarkComparer.js:compareBenchmarks()
↓
/server/services/analytics/reportGenerator.js:generateReport()
```

## Core Data Flow Patterns

### 1. User Behavior:
```
/server/services/analytics/behaviorTracker.js:trackBehavior()
↓
/server/services/analytics/userSegmentation.js:segmentUsers()
↓
/server/services/analytics/actionPredictor.js:predictActions()
↓
/server/services/analytics/recommendationEngine.js:generateRecommendations()
```

### 2. System Health:
```
/server/services/analytics/healthMonitor.js:monitorHealth()
↓
/server/services/analytics/issueDetector.js:detectIssues()
↓
/server/services/analytics/alertManager.js:manageAlerts()
↓
/server/services/analytics/resolutionTracker.js:trackResolutions()
```