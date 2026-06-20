import { createContext, useContext,useEffect, useState, type ReactNode } from 'react';

type Route =
  | { name: 'home' }
  | { name: 'auth'; next: string }
  | { name: 'upload' }
  | { name: 'resume'; id: string };

interface RouterContextType {
  route: Route;
  navigate: (to: string) => void;
}

const RouterContext = createContext<RouterContextType | null>(null);

export const useNavigate = () => {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useNavigate must be used within RouterProvider');
  return ctx.navigate;
};

export const useRoute = () => {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRoute must be used within RouterProvider');
  return ctx.route;
};

function parsePath(path: string): Route {
  if (path === '/' || path === '') return { name: 'home' };
  if (path.startsWith('/auth')) {
    const next = path.includes('next=') ? path.split('next=')[1] : '/';
    return { name: 'auth', next };
  }
  if (path === '/upload') return { name: 'upload' };
  const resumeMatch = path.match(/^\/resume\/(.+)$/);
  if (resumeMatch) return { name: 'resume', id: resumeMatch[1] };
  return { name: 'home' };
}

export const RouterProvider = ({ children }: { children: ReactNode }) => {
  const [route, setRoute] = useState<Route>(() =>
    parsePath(window.location.pathname + window.location.search)
  );

  useEffect(() => {
    const handlePopState = () => {
      setRoute(parsePath(window.location.pathname + window.location.search));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to: string) => {
    window.history.pushState({}, '', to);
    setRoute(parsePath(to));
  };

  return (
    <RouterContext.Provider value={{ route, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};
