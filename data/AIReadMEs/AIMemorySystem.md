# AI Memory System - Code Flow Guide

## System Entry Points

1. Memory Management:
```
/server/services/ai/memoryService.js:manageMemory()
↓
/server/services/ai/memoryStore.js:storeMemory()
↓
/server/services/ai/vectorDB.js:vectorize()
↓
/server/services/ai/memoryRetrieval.js:retrieveMemory()
```

2. Context Management:
```
/server/services/ai/contextService.js:manageContext()
↓
/server/services/ai/shortTermMemory.js:processShortTerm()
↓
/server/services/ai/longTermMemory.js:processLongTerm()
↓
/server/services/ai/memoryMerger.js:mergeMemories()
```

## Core Data Flow Patterns

### 1. Vector Operations:
```
/server/services/ai/vectorOperations.js:processVectors()
↓
/server/services/ai/embeddingGenerator.js:generateEmbeddings()
↓
/server/services/ai/similaritySearch.js:findSimilar()
↓
/server/services/ai/vectorOptimizer.js:optimizeVectors()
```

### 2. Memory Pruning:
```
/server/services/ai/pruningService.js:pruneMemory()
↓
/server/services/ai/relevanceScorer.js:scoreRelevance()
↓
/server/services/ai/memoryCompressor.js:compressMemory()
↓
/server/services/ai/storageOptimizer.js:optimizeStorage()
```