import { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import workbookService from '../services/workbookService';

const WorkbookContext = createContext();

const initialState = {
  currentProblem: null,
  activePage: 'requirements',
  pages: {
    requirements: { content: null, isDirty: false },
    api: { content: null, isDirty: false },
    data: { content: null, isDirty: false },
    architecture: { content: null, isDirty: false },
    scaling: { content: null, isDirty: false },
    reliability: { content: null, isDirty: false }
  },
  diagrams: {},
  lastSaved: null,
  problems: {},
  saveStatus: 'idle'
};

const workbookReducer = (state, action) => {
  switch (action.type) {
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

    case 'UPDATE_SECTION_DATA':
      return {
        ...state,
        problems: {
          ...state.problems,
          [action.problemId]: {
            ...state.problems[action.problemId],
            sections: {
              ...state.problems[action.problemId]?.sections,
              [action.section]: action.data
            },
            lastSaved: new Date().toISOString()
          }
        }
      };

    case 'UPDATE_PROGRESS':
      return {
        ...state,
        problems: {
          ...state.problems,
          [action.problemId]: {
            ...state.problems[action.problemId],
            progress: {
              ...state.problems[action.problemId]?.progress,
              [action.section]: action.progress
            }
          }
        }
      };

    default:
      return state;
  }
};

export const WorkbookProvider = ({ children }) => {
  const [state, dispatch] = useReducer(workbookReducer, {
    currentProblem: null,
    user: null,
    ...initialState
  });
  const router = useRouter();
  const { user } = useAuth();

  // Initialize workbook service
  const workbookService = useMemo(() => ({
    // ... your workbook service methods
  }), []);

  const updatePageContent = (pageId, content) => {
    dispatch({
      type: 'UPDATE_PAGE_CONTENT',
      pageId,
      content,
      isDirty: true
    });
  };

  const markPageAsSaved = (pageId) => {
    dispatch({
      type: 'MARK_PAGE_SAVED',
      pageId
    });
  };

  // Enhanced route change handler
  useEffect(() => {
    const handleRouteChange = async (url) => {
      const page = url.split('/').pop();
      if (page && page !== state.activePage && user?.id && state.currentProblem) {
        const problemData = state.problems[state.currentProblem] || {
          sections: {},
          diagrams: {},
          chat: [],
          progress: {}
        };

        try {
          await workbookService.saveAllData(
            state.currentProblem,
            state.activePage,
            problemData
          );
          dispatch({ type: 'SET_ACTIVE_PAGE', page });
        } catch (error) {
          console.error('Error saving workbook data during route change:', error);
          // Still update the page even if save fails
          dispatch({ type: 'SET_ACTIVE_PAGE', page });
        }
      } else {
        // If we don't have necessary data, just update the page
        if (page && page !== state.activePage) {
          dispatch({ type: 'SET_ACTIVE_PAGE', page });
        }
      }
    };

    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router, state, user]);

  // Load initial data
  useEffect(() => {
    if (!user?.id) return;

    const loadInitialData = async () => {
      try {
        // First try to load from localStorage
        const storedData = localStorage.getItem(`workbook_${user.id}`);
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          Object.keys(parsedData.problems || {}).forEach(problemId => {
            dispatch({
              type: 'LOAD_PROBLEM_DATA',
              problemId,
              data: parsedData.problems[problemId]
            });
          });
        }

        // Then try to fetch from server
        try {
          const response = await fetch(`/api/workbook/all?userId=${user.id}`, {
            credentials: 'include', // Important for auth cookies
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok) {
            console.warn(`Server returned ${response.status}: ${response.statusText}`);
            return; // Use local data if server fetch fails
          }

          const serverData = await response.json();
          
          Object.keys(serverData.problems || {}).forEach(problemId => {
            dispatch({
              type: 'LOAD_PROBLEM_DATA',
              problemId,
              data: serverData.problems[problemId]
            });
          });
        } catch (serverError) {
          console.warn('Failed to fetch from server:', serverError);
          // Continue with local data
        }
      } catch (error) {
        console.error('Error in loadInitialData:', error);
        // At least try to initialize with empty state
        dispatch({
          type: 'LOAD_PROBLEM_DATA',
          problemId: state.currentProblem,
          data: {}
        });
      }
    };

    loadInitialData();
  }, [user?.id]);

  // Auto-save effect
  useEffect(() => {
    if (state.saveStatus !== 'saving' || !user?.id || !state.currentProblem) return;

    const saveData = async () => {
      try {
        localStorage.setItem(`workbook_${user.id}`, JSON.stringify(state));

        await fetch('/api/workbook/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            state
          })
        });

        dispatch({ type: 'SET_SAVE_STATUS', status: 'idle' });
      } catch (error) {
        console.error('Error saving workbook:', error);
        dispatch({ type: 'SET_SAVE_STATUS', status: 'error' });
      }
    };

    const timeoutId = setTimeout(saveData, 1000);
    return () => clearTimeout(timeoutId);
  }, [state, user?.id]);

  // Add auto-save effect
  useEffect(() => {
    if (!user?.id || !state.currentProblem) return;

    const saveTimeout = setTimeout(() => {
      const problemData = state.problems[state.currentProblem];
      if (problemData) {
        workbookService.saveAllData(
          state.currentProblem,
          state.activePage,
          {
            sections: problemData.sections,
            diagrams: problemData.diagrams,
            progress: problemData.progress
          }
        ).catch(error => {
          console.error('Error auto-saving workbook data:', error);
        });
      }
    }, 2000); // 2 second debounce

    return () => clearTimeout(saveTimeout);
  }, [state.problems, state.currentProblem, state.activePage, user?.id]);

  const contextValue = {
    state,
    dispatch,
    updatePageContent,
    markPageAsSaved,
    userId: user?.id
  };

  return (
    <WorkbookContext.Provider value={contextValue}>
      {children}
    </WorkbookContext.Provider>
  );
}

// Custom hooks
export function useWorkbook() {
  const context = useContext(WorkbookContext);
  if (!context) {
    throw new Error('useWorkbook must be used within a WorkbookProvider');
  }
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

