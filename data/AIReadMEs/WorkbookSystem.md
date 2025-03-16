# Workbook System - Code Flow Guide

## System Entry Points

1. Workbook Creation:
```
/server/routes/api/workbook.js:handleWorkbookCreation()
↓
/server/services/workbook/workbookService.js:createWorkbook(userId, problemId)
↓
/server/services/workbook/templateManager.js:initializeTemplate()
↓
/server/services/workbook/workbookInitializer.js:setupWorkbook()
```

2. Progress Tracking:
```
/server/routes/api/progress.js:handleProgressUpdate()
↓
/server/services/workbook/progressTracker.js:updateProgress(workbookId)
↓
/server/services/workbook/validationService.js:validateProgress()
↓
/server/services/workbook/scoreCalculator.js:calculateCompletion()
```

## Core Data Flow Patterns

### 1. Content Management:
```
/server/services/workbook/contentManager.js:manageContent()
↓
/server/services/workbook/sectionHandler.js:processSection()
↓
/server/services/workbook/contentValidator.js:validateContent()
↓
/server/services/workbook/storageManager.js:saveContent()
```

### 2. Auto-save System:
```
/server/services/workbook/autoSave.js:initializeAutoSave()
↓
/server/services/workbook/changeDetector.js:detectChanges()
↓
/server/services/workbook/versionManager.js:createVersion()
↓
/server/services/workbook/backupService.js:backupContent()
```

### 3. Feedback Processing:
```
/server/services/workbook/feedbackProcessor.js:processFeedback()
↓
/server/services/workbook/aiAnalyzer.js:analyzeFeedback()
↓
/server/services/workbook/suggestionGenerator.js:generateSuggestions()
↓
/server/services/workbook/feedbackFormatter.js:formatFeedback()
```

## Integration Points

### 1. AI Integration:
```
/server/services/workbook/aiService.js:processWithAI()
↓
/server/services/ai/modelClients/workbookClient.js:analyzeWorkbook()
↓
/server/services/workbook/responseProcessor.js:processAIResponse()
↓
/server/services/workbook/contentUpdater.js:updateContent()
```

### 2. Database Integration:
```
/server/services/storage/workbookStorage.js:storeWorkbook()
↓
/server/models/Workbook.js:save()
↓
/server/services/storage/progressStorage.js:storeProgress()
↓
/server/models/Progress.js:save()
```

## Error Handling

### 1. Content Errors:
```
/server/services/workbook/errorHandler.js:handleContentError()
↓
/server/services/workbook/validation/contentValidator.js:validateContent()
↓
/server/services/workbook/errorFormatter.js:formatContentError()
↓
/server/services/workbook/responseHandler.js:sendContentError()
```

### 2. Save Errors:
```
/server/services/workbook/saveErrorHandler.js:handleSaveError()
↓
/server/services/workbook/recovery/recoveryManager.js:attemptRecovery()
↓
/server/services/workbook/backup/backupManager.js:restoreFromBackup()
↓
/server/services/workbook/notificationService.js:notifyUser()
```

## Monitoring and Analytics

### 1. Usage Analytics:
```
/server/services/analytics/workbookAnalytics.js:trackUsage()
↓
/server/services/analytics/metricCollector.js:collectMetrics()
↓
/server/services/analytics/dataAggregator.js:aggregateData()
↓
/server/services/analytics/reportGenerator.js:generateReport()
```

### 2. Performance Monitoring:
```
/server/services/monitoring/workbookMonitor.js:monitorPerformance()
↓
/server/services/monitoring/metricTracker.js:trackMetrics()
↓
/server/services/monitoring/alertManager.js:checkThresholds()
↓
/server/services/monitoring/reportService.js:generateAlert()
```