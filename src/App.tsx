import { useEffect } from 'react';
import { RouterProvider, useRoute } from './lib/router';
import { usePuterStore } from './lib/puter';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import UploadPage from './pages/UploadPage';
import ResumePage from './pages/ResumePage';

const AppContent = () => {
  const route = useRoute();

  switch (route.name) {
    case 'auth':
      return <AuthPage next={route.next} />;
    case 'upload':
      return <UploadPage />;
    case 'resume':
      return <ResumePage id={route.id} />;
    case 'home':
    default:
      return <HomePage />;
  }
};

const PuterInit = ({ children }: { children: React.ReactNode }) => {
  const { init } = usePuterStore();
  useEffect(() => { init(); }, []);
  return <>{children}</>;
};

function App() {
  return (
    <RouterProvider>
      <PuterInit>
        <AppContent />
      </PuterInit>
    </RouterProvider>
  );
}

export default App;
