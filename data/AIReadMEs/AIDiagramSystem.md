# AI Diagram System - Code Flow Guide

## System Entry Points

1. Diagram Management:
```
/client/components/diagram/SystemSequenceDiagram.js:SystemSequenceDiagramWrapper()
↓
/client/components/diagram/SystemSequenceDiagram.js:handleAddParticipant()
↓
/server/services/diagram/diagramDataProcessor.js:reactFlowToMermaid()
```

2. Node Management:
```
/client/components/diagram/SystemSequenceDiagram.js:handleAddParticipant()
↓
/client/components/diagram/SystemSequenceDiagram.js:handleNodeClick()
↓
/client/components/diagram/SystemSequenceDiagram.js:handleDeleteSelected()
```

## Testing Infrastructure:
```
/tests/services/diagram/diagramDataProcessor.test.js
/tests/diagram.test.js
/tests/api/workbook.test.js
```
