import { BrowserRouter } from 'react-router-dom'
import { AppRouter } from "@app/router";
import { AuthProvider } from './providers/AuthProvider';

/**
 * Root application component.
 * Wraps everything in BrowserRouter so all child components
 * can use React Router hooks (useNavigate, useParams, etc.)
 */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  );
}
