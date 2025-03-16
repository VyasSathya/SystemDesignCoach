# Interview System (Respiratory System)

## Conducting Full Interview Lifecycle
```
/server/services/engines/interviewEngine.js:startInterview()
↓
/server/services/engines/interviewEngine.js:processResponse()
↓
/server/services/engines/interviewEngine.js:finalizeInterview()
```

## Managing Interview Progress and Difficulty
```
/server/services/engines/interviewEngine.js:_shouldAdvanceStage()
↓
/server/services/engines/interviewEngine.js:_getNextStage()
↓
/server/services/engines/interviewEngine.js:_extractEntities()
```