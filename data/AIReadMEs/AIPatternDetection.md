# AI Pattern Detection System - Code Flow Guide

## System Entry Points

1. Pattern Detection:
```
/server/services/diagram/patterns/PatternDetector.js:detectPatterns()
↓
/server/services/diagram/patterns/PatternRegistry.js:_analyzePattern()
↓
/server/services/diagram/patterns/PatternTemplates.js:validatePattern()
↓
/server/services/diagram/NodeTypes/nodePresets.js:validateNodes()
```

2. Pattern Validation:
```
/server/services/diagram/patterns/PatternDetector.js:_detectLoadBalancing()
↓
/server/services/diagram/patterns/PatternDetector.js:_detectMicroservices()
↓
/server/services/diagram/patterns/PatternDetector.js:_detectCaching()
↓
/server/services/diagram/patterns/PatternDetector.js:_detectMessageQueue()
```

## Core Pattern Types

### 1. Load Balancing Pattern:
```
Required Components:
- loadBalancer (count: 1)
- service (minCount: 2)
Best Practices:
- Health checks implementation
- Multiple availability zones
- Session persistence consideration
```

### 2. Caching Pattern:
```
Required Components:
- cache (count: 1)
- service (minCount: 1)
Best Practices:
- Eviction policy configuration
- Monitoring implementation
- Cache invalidation strategy
```

### 3. Message Queue Pattern:
```
Required Components:
- queue (count: 1)
- service (minCount: 2)
Best Practices:
- Dead letter queues
- Message persistence
- Retry logic handling
```

### 4. API Gateway Pattern:
```
Required Components:
- gateway (count: 1)
- service (minCount: 1)
Best Practices:
- Authentication/authorization
- Rate limiting
- Request/response transformation
```