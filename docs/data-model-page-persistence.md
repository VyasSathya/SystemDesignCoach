# Data Model Page Persistence Implementation Guide

## Overview
This document outlines the implementation of data persistence for the DataModelPage component, which can serve as a template for implementing persistence in other pages.

## 1. Context Integration
First, integrate with the WorkbookContext to access shared state and services:

```javascript
import { useWorkbook } from '../context/WorkbookContext';

const DataModelPage = () => {
  const { state, dispatch, workbookService } = useWorkbook();
  const { currentProblem, problems } = state;
```

## 2. Initial State Structure
Define a clear initial state structure with default values:

```javascript
const dataModelData = problems[currentProblem]?.sections?.dataModel || {
  entities: [],
  relationships: [],
  databaseChoice: '',
  databaseJustification: ''
};
```

## 3. Centralized Save Function
Implement a central save function that handles both local state updates and backend persistence:

```javascript
const saveData = async (updatedData) => {
  // Update local state through Redux/Context
  dispatch({
    type: 'UPDATE_SECTION_DATA',
    problemId: currentProblem,
    section: 'dataModel',
    data: updatedData
  });

  // Persist to backend
  if (workbookService) {
    try {
      await workbookService.saveAllData(
        currentProblem,
        'dataModel',
        {
          sections: {
            dataModel: updatedData
          }
        }
      );
    } catch (error) {
      console.error('Failed to save:', error);
    }
  }
};
```

## 4. Entity Management Functions
Implement CRUD operations for entities:

```javascript
const addEntity = () => {
  const newEntity = {
    id: generateId(),
    text: '',
    name: 'New Entity'
  };
  const updatedData = {
    ...dataModelData,
    entities: [...dataModelData.entities, newEntity]
  };
  saveData(updatedData);
};

const updateEntity = (id, field, value) => {
  const updatedData = {
    ...dataModelData,
    entities: dataModelData.entities.map(entity =>
      entity.id === id ? { ...entity, [field]: value } : entity
    )
  };
  saveData(updatedData);
};

const deleteEntity = (id) => {
  const updatedData = {
    ...dataModelData,
    entities: dataModelData.entities.filter(entity => entity.id !== id)
  };
  saveData(updatedData);
};
```

## 5. Relationship Management Functions
Implement CRUD operations for relationships:

```javascript
const addRelationship = () => {
  const newRelationship = {
    id: generateId(),
    from: '',
    to: '',
    type: '',
    description: ''
  };
  const updatedData = {
    ...dataModelData,
    relationships: [...dataModelData.relationships, newRelationship]
  };
  saveData(updatedData);
};

const updateRelationship = (id, field, value) => {
  const updatedData = {
    ...dataModelData,
    relationships: dataModelData.relationships.map(rel =>
      rel.id === id ? { ...rel, [field]: value } : rel
    )
  };
  saveData(updatedData);
};

const deleteRelationship = (id) => {
  const updatedData = {
    ...dataModelData,
    relationships: dataModelData.relationships.filter(rel => rel.id !== id)
  };
  saveData(updatedData);
};
```

## 6. Database Selection Functions
Implement functions for database-related updates:

```javascript
const setDatabaseChoice = (value) => {
  const updatedData = {
    ...dataModelData,
    databaseChoice: value
  };
  saveData(updatedData);
};

const setDatabaseJustification = (value) => {
  const updatedData = {
    ...dataModelData,
    databaseJustification: value
  };
  saveData(updatedData);
};
```

## Key Implementation Principles

1. **Context Usage**
   - Use WorkbookContext for shared state
   - Access dispatch for local updates
   - Use workbookService for backend persistence

2. **Data Structure**
   - Maintain consistent data structure
   - Use default values for initialization
   - Follow immutable update patterns

3. **Save Pattern**
   - Centralize save logic
   - Update local state first
   - Persist to backend
   - Handle errors appropriately

4. **State Updates**
   - Use immutable updates with spread operator
   - Update specific fields only
   - Maintain data integrity

5. **Error Handling**
   - Wrap async operations in try/catch
   - Log errors appropriately
   - Maintain UI responsiveness

## Common Patterns

All data modifications should follow this pattern:
1. Create updated data object using immutable updates
2. Call centralized save function
3. Update both local state and backend
4. Handle any potential errors

## Testing Considerations

1. Test local state updates
2. Test backend persistence
3. Test error scenarios
4. Test concurrent updates
5. Test data validation

## Troubleshooting

Common issues and solutions:
- State not updating: Check dispatch calls
- Save not persisting: Check workbookService
- Data inconsistency: Check update logic
- Missing fields: Check initial state structure

```

This implementation guide provides a reusable pattern for implementing persistence across different pages in the application.