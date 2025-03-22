import { WorkbookProvider } from '../context/WorkbookContext';

export const withWorkbook = (WrappedComponent) => {
  return function WithWorkbookWrapper(props) {
    return (
      <WorkbookProvider>
        <WrappedComponent {...props} />
      </WorkbookProvider>
    );
  };
};