# Workbook State Management Design

## Version History
v1.0.0 - Initial design
v1.1.0 - Removed coaching implementation
v1.1.1 - Added AI development guidelines
v1.1.2 - Added system constraints and quick start guide
v1.2.0 - Reorganized implementation priorities focusing on navigation state persistence
v1.2.1 - Updated implementation status ✓

## System Architecture

### Data Flow
```javascript
// Client-side Flow
UI Components -> WorkbookContext -> Storage Service -> API Service
                     ↑                    ↓
              State Manager         Local Storage
                     ↑                    ↓
              Auto-save Service     IndexedDB (offline)

// Server-side Flow
API Routes -> Workbook Service -> Content Manager -> Storage Manager
                  ↓                    ↓                  ↓
           Progress Tracker    Pattern Detector     Database (MongoDB)
```

### Storage Structure

1. **MongoDB Collections**
```javascript
// WorkbookData Collection
{
  userId: ObjectId,
  problemId: String,
  diagrams: {
    system: { nodes, edges, mermaidCode, lastUpdated },
    sequence: { nodes, edges, mermaidCode, lastUpdated }
  },
  sections: {
    requirements: Mixed,
    api: Mixed,
    database: Mixed,
    architecture: Mixed
  },
  progress: {
    overall: Number,
    sections: Map<string, number>,
    lastUpdated: Date
  },
  chat: [{
    role: String,
    content: String,
    timestamp: Date,
    metadata: Map
  }]
}

// Interview/Coaching Session Collection
{
  userId: ObjectId,
  problemId: String,
  type: 'interview' | 'coaching',
  status: 'pending' | 'in_progress' | 'completed',
  conversation: [{
    role: 'interviewer' | 'candidate' | 'coach' | 'student' | 'system',
    content: String,
    timestamp: Date,
    metadata: Map
  }],
  currentStage: String,
  learningPatterns: {
    vocabularyLevel: String,
    conceptualUnderstanding: String,
    communicationStyle: String,
    lastTopics: [String]
  },
  evaluation: {
    score: Number,
    feedback: String,
    criteriaScores: Map
  }
}
```

2. **Local Storage**
```javascript
// Primary Workbook State
`workbook_${userId}_${problemId}`: {
  currentTab: string,
  lastModified: timestamp,
  sections: {...},
  chat: [{
    role: String,
    content: String,
    timestamp: Date,
    metadata: Map
  }]
}

// Chat History
`chat_${userId}_${problemId}`: {
  messages: [{
    role: String,
    content: String,
    timestamp: Date,
    metadata: Map
  }],
  lastSync: timestamp
}

// Coaching Session State
`coaching_${userId}_${problemId}`: {
  currentStage: String,
  learningPatterns: Object,
  lastInteraction: timestamp
}
```

## Implementation Priority List

### Phase 1: Navigation State & Auto-save (Week 1-2)
1. Page Navigation State Management
   - [✓] Implement state persistence between page flips
   - [✓] Add state recovery on page reload
   - [✓] Handle browser back/forward navigation

2. Auto-save System
   - [✓] Implement debounced saves (2s interval)
   - [✓] Add save indicators
   - [~] Handle concurrent saves
   - [~] Implement save queuing

3. Error Recovery
   - [✓] Add local storage fallback
   - [~] Implement retry mechanism
   - [×] Add conflict resolution
   - [×] Handle network interruptions

### Phase 2: Diagram System (Week 2-3)
1. Diagram State Management
   - [✓] Real-time diagram updates
   - [×] Diagram version control
   - [×] Performance optimization for large diagrams

### Phase 3: Progress & Analytics (Week 3-4)
1. Progress System
   - [~] Section completion tracking
   - [~] Progress persistence
   - [×] Analytics integration

### Phase 4: Chat Integration (Week 4-5)
1. Chat System
   - [✓] Message persistence
   - [~] Real-time updates
   - [×] History management

### Phase 5: Polish & Optimization (Week 5-6)
1. Performance Optimization
   - [×] State management optimization
   - [×] Network call reduction
   - [×] Caching improvements

## Technical Implementation Details

### 1. Navigation State Management

```javascript
// WorkbookContext Structure
const WorkbookContext = {
  state: {
    currentPage: String,
    lastSavedAt: Date,
    saveStatus: 'idle' | 'saving' | 'error',
    pendingChanges: Boolean,
    sections: {
      current: String,
      data: Map<string, any>,
      unsavedChanges: Map<string, boolean>
    },
    diagram: {
      current: String,
      data: DiagramData,
      lastSaved: Date
    }
  },
  actions: {
    navigateTo: (page: string) => void,
    savePage: () => Promise<void>,
    handlePageExit: () => void,
    recoverState: () => Promise<void>
  }
}

// Auto-save Service
const AutoSaveService = {
  saveQueue: [],
  isSaving: false,

  queueSave: (data) => {
    saveQueue.push({
      timestamp: Date.now(),
      data,
      retryCount: 0
    });
    processSaveQueue();
  },

  processSaveQueue: async () => {
    if (isSaving || saveQueue.length === 0) return;
    
    isSaving = true;
    const item = saveQueue[0];
    
    try {
      await saveToServer(item.data);
      saveQueue.shift();
    } catch (error) {
      handleSaveError(item);
    } finally {
      isSaving = false;
      if (saveQueue.length > 0) {
        processSaveQueue();
      }
    }
  }
}
```

### 2. Save Status Management

```javascript
// Save Status Flow
1. User Action -> Update Local State
2. Trigger Auto-save -> Queue Save
3. Process Save Queue -> Update Status
4. Handle Result -> Update UI

// Status Indicators
- Saving: Show spinner
- Saved: Show checkmark
- Error: Show warning with retry option
```

### 3. Error Recovery

```javascript
// Error Handling Strategy
1. Network Error -> Queue for retry
2. Conflict Error -> Merge changes
3. Storage Error -> Use fallback
4. Fatal Error -> Save to IndexedDB

// Recovery Flow
1. Check IndexedDB for pending saves
2. Compare with server state
3. Resolve conflicts
4. Sync changes
```

## Integration Points

1. **Diagram System**
- Use existing `diagramManager.js` flow
- Add local state persistence
- Implement merge strategy for conflicts

2. **Progress Tracking**
- Integrate with `progressTracker.js`
- Cache progress locally
- Real-time updates via WebSocket

3. **Content Validation**
- Use `contentValidator.js` before saves
- Implement conflict resolution
- Maintain version history

## Migration Steps

1. **Phase 1: Storage Migration**
```javascript
// Migration Script Flow
1. Identify active sessions
2. Map sessions to user/problem pairs
3. Transform storage keys
4. Validate data integrity
5. Update references in components
```

2. **Phase 2: Component Updates**
- Implement WorkbookContext
- Update diagram components
- Add offline support
- Implement progress tracking

3. **Phase 3: Service Integration**
- Update API endpoints
- Implement sync service
- Add WebSocket support
- Enable version control

## Security Measures

1. **Data Access**
- Validate user ownership
- Encrypt sensitive data
- Implement rate limiting
- Add request validation

2. **State Management**
- Clear sensitive data on logout
- Validate state transitions
- Implement access controls

## Performance Optimizations

1. **Storage**
- Separate large diagram data
- Implement lazy loading
- Use efficient indexing
- Cache frequently accessed data

2. **Sync Strategy**
```javascript
// Enhanced sync flow including chat and coaching
1. Regular content -> 3s debounce
2. Chat messages -> Immediate local + 1s debounce server
3. Coaching state -> Immediate local + server
4. Diagrams -> Immediate local + 2s debounce server

// Offline handling
1. Queue changes in IndexedDB
2. Sync on reconnect
3. Merge strategy for conflicts
```

## Testing Strategy

### 1. Navigation Tests
- Page transition persistence
- Browser navigation handling
- State recovery
- Concurrent save handling

### 2. Auto-save Tests
- Save triggering
- Queue processing
- Error recovery
- Conflict resolution

### 3. Performance Tests
- Save latency
- State management overhead
- Memory usage
- Network optimization

## System Constraints

```javascript
{
  "autoSave": {
    "debounceDelay": 2000,
    "maxRetries": 3,
    "queueLimit": 10,
    "conflictWindow": 5000
  },
  "storage": {
    "localStorageLimit": "5MB",
    "indexedDBLimit": "50MB",
    "maxDiagramSize": "1MB"
  },
  "performance": {
    "maxSaveLatency": 1000,
    "maxStateSize": "2MB",
    "maxConcurrentSaves": 3
  }
}
```

## Monitoring & Metrics

### 1. Performance Metrics
- Save operation latency
- Sync success rate
- Storage usage

### 2. Error Tracking
- Failed operations
- Sync conflicts
- Storage errors

### 3. Usage Analytics
- Feature usage
- Error patterns
- Performance bottlenecks

## AI Development Guidelines

### Key File Locations
```javascript
// Core Services
/server/services/ai/aiService.js         // Main AI service integration
/server/services/ai/promptBuilder.js     // Prompt construction
/server/services/ai/responseHandler.js   // Response processing

// State Management
/client/context/WorkbookContext.js       // Client state management
/server/services/workbook/              // Server-side workbook handling
/server/services/storage/               // Data persistence

// Real-time Features
/server/services/sync/                  // Sync management
/client/services/autoSave.js           // Auto-save implementation
```

### State Flow Reference
```javascript
// Data Flow Patterns
1. User Input -> Local State -> Auto-save Queue -> Server Sync
2. AI Response -> Message Store -> Chat History -> Local Cache
3. Diagram Updates -> Local Save -> Debounced Sync -> Version Control

// State Update Sequence
1. Update local state (immediate)
2. Trigger auto-save (debounced)
3. Sync with server (conditional)
4. Update UI indicators
```

### Critical Dependencies
```javascript
{
  "required": {
    "mongodb": "For persistent storage",
    "anthropic": "AI service integration",
    "socket.io": "Real-time updates",
    "indexeddb": "Offline storage"
  },
  "optional": {
    "redis": "Caching layer",
    "bull": "Job queues"
  }
}
```

### Error Handling Patterns
```javascript
// Common Error Scenarios
1. Network Failures -> Retry with exponential backoff
2. AI Service Timeout -> Cache last known good state
3. Storage Conflicts -> Merge strategy with timestamps
4. Sync Failures -> Queue for retry with status tracking
```

### System Constraints
```javascript
{
  "limits": {
    "maxMessageSize": "4000 tokens",
    "autoSaveInterval": "3000ms",
    "syncDebounce": "1000ms",
    "offlineStorage": "50MB",
    "maxDiagramNodes": "100"
  },
  "thresholds": {
    "performanceWarning": "2000ms",
    "storageWarning": "80%",
    "errorRateAlert": "5%"
  }
}
```

### AI Integration Points

1. **Message Processing**
```javascript
// Input Processing
- Context gathering from WorkbookContext
- State validation before processing
- Token count management

// Output Handling
- Response validation
- State updates
- Error recovery
```

2. **State Observation**
```javascript
// Key Monitoring Points
- User interaction patterns
- Save/sync status
- Error frequencies
- Performance metrics
```

3. **Recovery Procedures**
```javascript
// Common Recovery Scenarios
- Connection loss recovery
- State inconsistency resolution
- Partial update completion
- Cache invalidation
```

### Version Control Strategy
```javascript
// Version Management
1. Major state changes -> New version
2. Periodic snapshots -> 5-minute intervals
3. Manual save points -> User triggered
4. Conflict resolution -> Latest wins with merge
```

### Development Workflow
```javascript
// Feature Implementation Pattern
1. Local state implementation
2. Persistence layer integration
3. Sync mechanism setup
4. Error handling implementation
5. Performance optimization
6. Testing & validation

// Testing Requirements
1. Unit tests for state mutations
2. Integration tests for sync flows
3. E2E tests for user scenarios
4. Performance benchmarks
```

## Quick Start Guide

### 1. Initial Setup
```bash
# Required environment variables
MONGODB_URI=mongodb://localhost:27017/workbook
ANTHROPIC_API_KEY=your_api_key
REDIS_URL=redis://localhost:6379

# Installation
npm install
npm run setup-dev
```

### 2. Development Flow
```javascript
// Local Development
1. Start local MongoDB
2. Run development server
3. Enable debug logging
4. Monitor state changes

// Testing
1. Run unit tests: npm run test:unit
2. Run integration tests: npm run test:integration
3. Run E2E tests: npm run test:e2e
```

### 3. Common Issues & Solutions
```javascript
{
  "stateDesync": "Clear local storage and reload",
  "syncFailed": "Check network and retry",
  "saveFailed": "Verify storage quota and permissions",
  "aiTimeout": "Check token limits and retry"
}
```



