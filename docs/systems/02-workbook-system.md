# Workbook System (Circulatory System)

## Saving and Managing User's System Design Work: Handling Content Updates and Version Control with Structured Data Management
```
/server/routes/api/workbook.js:handleWorkbookUpdate()
↓
/server/models/Workbook.js:save()
↓
/server/services/workbook/contentManager.js:processContent()
```

## Handling Real-time Diagram Updates and Analysis: Processing Live Diagram Changes while Detecting and Analyzing Design Patterns
```
/client/components/diagram/SystemSequenceDiagram.js:handleAddParticipant()
↓
/client/components/ReactFlowDiagram.js:handleDiagramUpdate()
↓
/server/services/diagram/diagramManager.js:updateDiagram()
↓
/server/services/diagram/patternDetector.js:analyzePatterns()
```

## Protecting User Progress with Automatic Saving: Implementing Continuous Auto-Save with Version History and Recovery Options
```
/client/services/autoSave.js:initializeAutoSave()
↓
/server/routes/api/workbook.js:handleAutoSave()
↓
/server/models/Workbook.js:updateContent()
```