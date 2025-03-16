# AI Security Guidelines - Code Flow Guide

## System Entry Points

1. Input Validation:
```
/server/services/security/inputValidator.js:validateInput()
↓
/server/services/security/sanitizer.js:sanitizeInput()
↓
/server/services/security/injectionDetector.js:detectInjection()
↓
/server/services/security/inputFormatter.js:formatInput()
```

2. Output Protection:
```
/server/services/security/outputProtector.js:protectOutput()
↓
/server/services/security/contentFilter.js:filterContent()
↓
/server/services/security/sensitiveDataDetector.js:detectSensitiveData()
↓
/server/services/security/outputSanitizer.js:sanitizeOutput()
```

## Core Data Flow Patterns

### 1. PII Handling:
```
/server/services/security/piiHandler.js:handlePII()
↓
/server/services/security/piiDetector.js:detectPII()
↓
/server/services/security/piiMasker.js:maskPII()
↓
/server/services/security/piiLogger.js:logPIIAccess()
```

### 2. Prompt Security:
```
/server/services/security/promptSecurity.js:securePrompt()
↓
/server/services/security/boundaryChecker.js:checkBoundaries()
↓
/server/services/security/promptValidator.js:validatePrompt()
↓
/server/services/security/securityEnforcer.js:enforceRules()
```