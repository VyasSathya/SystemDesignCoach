# AI Diagram System - Code Flow Guide

## System Entry Points

1. Diagram Management:
```
/client/components/ReactFlowDiagram.js:ReactFlowDiagramWithProvider()
↓
/client/components/ReactFlowDiagram.js:Flow()
↓
/server/models/Diagram.js:save()
```

2. Node Management:
```
/server/services/diagram/NodeTypes/nodePresets.js:createNode()
↓
/server/services/diagram/NodeTypes/nodePresets.js:getDefaultProperties()
↓
/client/components/ReactFlowDiagram.js:handleNodeAdd()
```

## Core Data Flow Patterns

### 1. Node Operations:
```
/client/components/ReactFlowDiagram.js:onNodesChange()
↓
/client/components/ReactFlowDiagram.js:handleConnect()
↓
/client/components/ReactFlowDiagram.js:handleDelete()
```

### 2. Layout Management:
```
/client/components/ReactFlowDiagram.js:onDrop()
↓
/client/components/ReactFlowDiagram.js:onDragOver()
↓
/client/components/ReactFlowDiagram.js:fitView()
```

### 3. Diagram Validation:
```
/server/models/Diagram.js:validateNode()
↓
/server/models/Diagram.js:validateEdge()
↓
/server/services/diagram/NodeTypes/nodePresets.js:isValidType()
```