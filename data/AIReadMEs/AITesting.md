# AI Testing - Code Flow Guide

## System Entry Points

1. Test Execution:
```
/server/services/testing/testRunner.js:runTests()
↓
/server/services/testing/promptTester.js:testPrompts()
↓
/server/services/testing/responseTester.js:testResponses()
↓
/server/services/testing/resultCollector.js:collectResults()
```

2. Regression Testing:
```
/server/services/testing/regressionTester.js:testRegression()
↓
/server/services/testing/baselineManager.js:compareBaseline()
↓
/server/services/testing/diffAnalyzer.js:analyzeDiffs()
↓
/server/services/testing/reportGenerator.js:generateReport()
```

## Core Data Flow Patterns

### 1. Performance Testing:
```
/server/services/testing/performanceTester.js:testPerformance()
↓
/server/services/testing/metricCollector.js:collectMetrics()
↓
/server/services/testing/benchmarkRunner.js:runBenchmarks()
↓
/server/services/testing/performanceAnalyzer.js:analyzePerformance()
```

### 2. Response Validation:
```
/server/services/testing/responseValidator.js:validateResponse()
↓
/server/services/testing/formatChecker.js:checkFormat()
↓
/server/services/testing/contentValidator.js:validateContent()
↓
/server/services/testing/qualityAssessor.js:assessQuality()
```

### 3. Test Data Management:
```
/server/services/testing/testDataManager.js:manageTestData()
↓
/server/services/testing/dataGenerator.js:generateData()
↓
/server/services/testing/dataValidator.js:validateData()
↓
/server/services/testing/dataStorage.js:storeTestData()
```