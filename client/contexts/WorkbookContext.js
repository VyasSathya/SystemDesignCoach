import { createContext, useContext, useReducer, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from './AuthContext';
import { workbookService as actualWorkbookService } from '../services/workbookService';

console.log('--- WorkbookContext.js: Module execution start ---'); // Add log

// TEMPORARILY COMMENT OUT SaveQueue
/*
class SaveQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
  }

  async add(saveOperation, retries = 3) {
    console.log('Adding to save queue, current length:', this.queue.length + 1);
    return new Promise((resolve, reject) => {
      this.queue.push({
        operation: saveOperation,
        retries,
        resolve,
        reject,
        timestamp: new Date()
      });
      this.process();
    });
  }

  async process() {
    if (this.processing || this.queue.length === 0) return;
    
    console.log('Processing save queue, items remaining:', this.queue.length);
    this.processing = true;

    const { operation, retries, resolve, reject, timestamp } = this.queue[0];
    
    try {
      const result = await operation();
      this.queue.shift();
      console.log('Save successful, queue length:', this.queue.length);
      resolve(result);
    } catch (error) {
      console.error('Save failed, retries left:', retries - 1, error);
      if (retries > 0) {
        this.queue[0].retries--;
        setTimeout(() => this.process(), 1000 * (3 - retries));
      } else {
        this.queue.shift();
        reject(error);
      }
    } finally {
      this.processing = false;
      if (this.queue.length > 0) {
        this.process();
      }
    }
  }
}
*/
// const saveQueue = new SaveQueue(); // Temporarily comment out instance
const saveQueue = null; // Provide null placeholder

console.log('--- WorkbookContext.js: Creating context ---'); // Add log
const WorkbookContext = createContext();

// Restore original initial state
const initialState = {
  currentProblem: null,
  activePage: 'requirements', // Default active page
  problems: {}, // Store data per problem ID
  diagrams: {}, // Kept for potential global diagrams? Review if needed.
  lastSaved: null,
  saveStatus: 'idle', // 'idle', 'saving', 'saved', 'error'
  isInitialized: false // Flag to indicate if context is ready
};
// const initialState = { isInitialized: false }; // Remove or comment out minimal state

console.log('--- WorkbookContext.js: Defining workbookReducer ---'); // Add log
const workbookReducer = (state, action) => {
  console.log('REDUCER Action:', action.type, 'Payload:', action);
  switch (action.type) {
    case 'INITIALIZE_CONTEXT':
      console.log('<<< Reducer handling INITIALIZE_CONTEXT');
      return { ...state, isInitialized: true };
    case 'SET_ACTIVE_PAGE':
      return {
        ...state,
        activePage: action.page,
        problems: {
          ...state.problems,
          [state.currentProblem]: {
            ...state.problems[state.currentProblem],
            activePage: action.page,
            lastSaved: new Date().toISOString()
          }
        }
      };

    case 'SET_CURRENT_PROBLEM':
      return {
        ...state,
        currentProblem: action.problemId,
        activePage: state.problems[action.problemId]?.activePage || 'requirements'
      };

    case 'LOAD_PROBLEM_DATA':
      return {
        ...state,
        problems: {
          ...state.problems,
          [action.problemId]: {
            sections: {},
            diagrams: {},
            chat: [],
            progress: {},
            ...action.data,
            activePage: action.data.activePage || state.problems[action.problemId]?.activePage || 'requirements'
          }
        }
      };

    case 'UPDATE_DIAGRAM':
      if (!state.currentProblem) return state;
      return {
        ...state,
        problems: {
          ...state.problems,
          [state.currentProblem]: {
            ...state.problems[state.currentProblem],
            diagrams: {
              ...state.problems[state.currentProblem]?.diagrams,
              [action.diagramType]: action.data
            }
          }
        },
        saveStatus: 'saving'
      };

    case 'UPDATE_SECTION_DATA': {
      const currentProblemState = state.problems?.[action.problemId];
      const currentSectionData = currentProblemState?.sections?.[action.section];

      // If section data hasn't changed (deep check via JSON stringify), return original state
      // NOTE: This is a simple deep comparison. For complex objects, a library might be better,
      // but this handles cases where new object references with same content are passed.
      if (JSON.stringify(currentSectionData) === JSON.stringify(action.data)) {
        return state;
      }

      // Otherwise, proceed with the update
      return {
        ...state,
        problems: {
          ...state.problems,
          [action.problemId]: {
            ...currentProblemState,
            // Handle nested update for diagrams based on subSection
            sections: action.section === 'diagrams' && action.subSection ? 
              currentProblemState?.sections : // Keep other sections if updating diagram
              { 
                ...currentProblemState?.sections,
                [action.section]: action.data
              },
            diagrams: action.section === 'diagrams' && action.subSection ?
              {
                ...currentProblemState?.diagrams,
                [action.subSection]: action.data // Update specific diagram type
              } : 
              currentProblemState?.diagrams, // Keep diagrams if updating other section
            lastSaved: new Date().toISOString()
          }
        }
      };
    }

    case 'UPDATE_PROGRESS': {
      const currentProblemState = state.problems?.[action.problemId];
      const currentProgress = currentProblemState?.progress?.[action.section];
      
      // If progress hasn't changed, return the original state to prevent loops
      if (currentProgress === action.progress) {
        return state;
      }

      // Otherwise, proceed with the update, creating new objects as needed
      return {
        ...state,
        problems: {
          ...state.problems,
          [action.problemId]: {
            ...currentProblemState,
            progress: {
              ...currentProblemState?.progress,
              [action.section]: action.progress
            }
          }
        }
      };
    }

    default:
      return state;
  }
};
console.log('--- WorkbookContext.js: Finished defining workbookReducer ---'); // Add log

console.log('--- WorkbookContext.js: Defining WorkbookProvider ---'); // Add log
export const WorkbookProvider = ({ children }) => {
  console.log('--- WorkbookProvider function executing ---'); 
  const [state, dispatch] = useReducer(workbookReducer, initialState);
  const router = useRouter(); // Restore useRouter hook
  const { user } = useAuth();
  
  const lastSavedDataRef = useRef(null);
  
  // Dispatch initialization action on mount
  useEffect(() => {
    console.log('>>> WorkbookProvider mounted, dispatching INITIALIZE_CONTEXT');
    dispatch({ type: 'INITIALIZE_CONTEXT' });
  }, []); 

  // Effect to load data when currentProblemId changes and data is not already loaded
  useEffect(() => {
    const problemId = state.currentProblem; 
    // Only run if initialized, have a problemId, and data isn't already loaded for it
    if (state.isInitialized && problemId && !state.problems?.[problemId]) {
      console.log(`>>> WorkbookProvider: Triggering data load for problemId: ${problemId}`);
      const fetchData = async () => {
        try {
          // Use the imported service object and its method
          const data = await actualWorkbookService.loadProblemData(problemId); // Use object.method
          
          // Dispatch action to load the fetched data into state
          dispatch({ type: 'LOAD_PROBLEM_DATA', problemId, data });

        } catch (error) {
          console.error(`>>> WorkbookProvider: Failed to load data for problem ${problemId}:`, error);
        }
      };
      fetchData();
    }
  }, [state.isInitialized, state.currentProblem, state.problems, dispatch]);

  // Provide the ACTUAL workbook service object
  const workbookService = useMemo(() => actualWorkbookService, []); // Pass the imported object

  // Placeholder functions
  const updatePageContent = (pageId, content) => { console.warn('updatePageContent not implemented'); };
  const markPageAsSaved = (pageId) => { console.warn('markPageAsSaved not implemented'); };

  // RESTORE Route Change Handler Effect (Ensure router guards are present)
  useEffect(() => {
    const handleRouteChange = async (url) => {
      if (!router) return; // Keep guard
      const page = url.split('/').pop();
      if (page && state.activePage && page !== state.activePage && user?.id && state.currentProblem) {
        const problemData = state.problems[state.currentProblem] || {
          sections: {},
          diagrams: {},
          chat: [],
          progress: {}
        };

        // Check if workbookService exists before calling
        if (workbookService && typeof workbookService.saveAllData === 'function') { 
          dispatch({ type: 'SET_SAVE_STATUS', status: 'saving' });
          try {
            // Temporarily remove saveQueue usage
            // await saveQueue.add(async () => { ... }); 
            console.warn('SaveQueue temporarily disabled in route change.')
            // Manually call save for testing (REMOVE LATER)
            await workbookService.saveAllData(state.currentProblem, state.activePage, problemData);
            
            dispatch({ type: 'SET_SAVE_STATUS', status: 'saved' });
            dispatch({ type: 'SET_ACTIVE_PAGE', page });
          } catch (error) {
            console.error('Error saving workbook data on route change:', error);
            dispatch({ type: 'SET_SAVE_STATUS', status: 'error' });
            dispatch({ type: 'SET_ACTIVE_PAGE', page });
          }
        } else {
           console.warn('Route change: workbookService.saveAllData not available, skipping save.');
           dispatch({ type: 'SET_ACTIVE_PAGE', page }); // Still navigate
        }
      } else if (page && page !== state.activePage) {
         // If other conditions aren't met but page changed, still update active page
         dispatch({ type: 'SET_ACTIVE_PAGE', page });
      }
    };
    if (router?.events) { // Keep guard
      console.log('>>> WorkbookProvider attaching routeChangeStart listener');
      router.events.on('routeChangeStart', handleRouteChange);
      return () => {
        console.log('>>> WorkbookProvider detaching routeChangeStart listener');
        router.events.off('routeChangeStart', handleRouteChange);
      };
    }
  }, [router, state.activePage, state.currentProblem, user?.id, dispatch, workbookService]);

  // RESTORE Load Initial Data Effect
  useEffect(() => {
    if (!user?.id) {
       console.log('>>> Load Initial Data: No user ID, skipping.');
       return;
    }
    console.log('>>> Load Initial Data: Starting for user:', user.id);
    const loadInitialData = async () => {
      try {
        console.log('>>> Load Initial Data: Trying localStorage...');
        const storedData = localStorage.getItem(`workbook_${user.id}`);
        if (storedData) {
          console.log('>>> Load Initial Data: Found localStorage data.');
          const parsedData = JSON.parse(storedData);
          Object.keys(parsedData.problems || {}).forEach(problemId => {
            console.log(`>>> Load Initial Data: Dispatching LOAD_PROBLEM_DATA for ${problemId} from localStorage.`);
            dispatch({
              type: 'LOAD_PROBLEM_DATA',
              problemId,
              data: parsedData.problems[problemId]
            });
          });
        } else {
           console.log('>>> Load Initial Data: No localStorage data found.');
        }
        // TODO: Add server fetch logic back if needed (Ensure it doesn't set currentProblem)
      } catch (error) {
        console.error('>>> Load Initial Data: Outer error:', error);
      }
    };
    loadInitialData();
  }, [user?.id, dispatch]);

  // RESTORE Auto-save effect
  useEffect(() => {
    const autoSave = () => {
      if (!user?.id || !state.currentProblem || !state.isInitialized) return;
      const problemData = state.problems[state.currentProblem];
      if (!problemData) return;
      const dataToSave = JSON.stringify({ sections: problemData.sections, diagrams: problemData.diagrams, progress: problemData.progress });
      if (dataToSave !== lastSavedDataRef.current) {
        console.log('Auto-save triggered: Data changed.');
        lastSavedDataRef.current = dataToSave;
        if (workbookService && typeof workbookService.saveAllData === 'function') {
            dispatch({ type: 'SET_SAVE_STATUS', status: 'saving' });
            // Temporarily remove saveQueue usage
            // saveQueue.add(async () => { ... })
            console.warn('SaveQueue temporarily disabled in auto-save.');
            // Manually trigger save for testing (REMOVE LATER)
            workbookService.saveAllData(state.currentProblem, state.activePage, { sections: problemData.sections, diagrams: problemData.diagrams, progress: problemData.progress })
            .then(() => { dispatch({ type: 'SET_SAVE_STATUS', status: 'saved' }); })
            .catch(error => { console.error('Error auto-saving:', error); dispatch({ type: 'SET_SAVE_STATUS', status: 'error' }); lastSavedDataRef.current = null; });
        } else {
            console.warn('Auto-save: workbookService.saveAllData not available.')
        }
      }
    };
    const saveTimeout = setTimeout(autoSave, 2000);
    return () => clearTimeout(saveTimeout);
  }, [state.currentProblem, state.activePage, state.problems, state.isInitialized, user?.id, dispatch, workbookService]);

  // Memoize the context value
  const contextValue = useMemo(() => ({
    state,
    dispatch,
    updatePageContent,
    markPageAsSaved,
    userId: user?.id, // Will be null now
    workbookService
  }), [state, user?.id, workbookService]);

  console.log('--- WorkbookContext.js: Finished defining WorkbookProvider ---'); // Add log

  return (
    <WorkbookContext.Provider value={contextValue}>
      {children}
    </WorkbookContext.Provider>
  );
}

// Custom hooks
console.log('--- WorkbookContext.js: Defining custom hooks ---'); // Add log
export function useWorkbook() {
  const context = useContext(WorkbookContext);
  console.log("useWorkbook received context:", context);

  // If context or state isn't ready, or not initialized, return null
  if (!context || !context.state || !context.state.isInitialized) {
    console.log("useWorkbook: Context not ready or not initialized yet.");
    return null; // Return null instead of throwing
  }
  
  // Only return the context if it's fully initialized
  return context;
}

export function useDiagram(type) {
  const { state, dispatch } = useWorkbook();
  const currentProblem = state.currentProblem;
  const diagram = state.problems[currentProblem]?.diagrams?.[type];

  const updateDiagram = (data) => {
    dispatch({ type: 'UPDATE_DIAGRAM', diagramType: type, data });
  };

  return [diagram, updateDiagram];
}

export function useSection(sectionName) {
  const { state, dispatch } = useWorkbook();
  const currentProblem = state.currentProblem;
  const sectionData = state.problems[currentProblem]?.sections?.[sectionName];

  const updateSection = (data) => {
    dispatch({ type: 'UPDATE_SECTION_DATA', sectionName, data });
  };

  return [sectionData, updateSection];
}

console.log('--- WorkbookContext.js: Module execution end ---'); // Add log 