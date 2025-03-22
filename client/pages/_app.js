import '../styles/globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import { WorkbookProvider } from '../contexts/WorkbookContext';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <WorkbookProvider>
        <Component {...pageProps} />
      </WorkbookProvider>
    </AuthProvider>
  );
}

export default MyApp;
