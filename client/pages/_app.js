import '../styles/globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import { WorkbookProvider } from '../contexts/WorkbookContext';
import ErrorBoundary from '../components/ErrorBoundary'; // Make sure this import is added

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <ErrorBoundary> 
        <WorkbookProvider>
          <Component {...pageProps} />
        </WorkbookProvider>
      </ErrorBoundary> 
    </AuthProvider>
  );
}

export default MyApp;