import { 
  createContext, 
  useContext, 
  useReducer, 
  useEffect, 
  useMemo,
  useState
} from 'react';
import { useRouter } from 'next/router';
import { useAuth } from './AuthContext';
import workbookService from '../services/workbookService';

const WorkbookContext = createContext(null);

const initialState = {
  diagrams: {},
  sections: {},
  metadata: {
    lastUpdated: null,
    version: 1
  }
};

export function WorkbookProvider({ children }) {
  const [state, setState] = useState(initialState);

  const value = useMemo(() => ({
    workbookState: state,
    setWorkbookState: setState
  }), [state]);

  return (
    <WorkbookContext.Provider value={value}>
      {children}
    </WorkbookContext.Provider>
  );
}

export function useWorkbook() {
  const context = useContext(WorkbookContext);
  if (!context) {
    throw new Error('useWorkbook must be used within a WorkbookProvider');
  }
  return context;
}

export { WorkbookContext };



