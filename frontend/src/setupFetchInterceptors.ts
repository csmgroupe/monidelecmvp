import { reduxStore } from '@/store/reduxStore';
import { actions } from '@/modules/auth/application/auth.actions';
import { PATHS } from '@/config/paths';

// Save original fetch implementation
const originalFetch = window.fetch.bind(window);

// Override global fetch
window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  // Ensure cookies are always sent (credentials include), unless explicitly specified otherwise
  const mergedInit: RequestInit = {
    credentials: 'include',
    ...init,
  };

  const response = await originalFetch(input, mergedInit);

  if (response.status === 401) {
    // Dispatch logout to clear auth state
    reduxStore.dispatch(actions.logout());

    // Prevent redirect loop if we are already on any auth route
    const currentPath = window.location.pathname;
    const isOnAuthRoute = currentPath.startsWith(PATHS.auth.base) || 
                         currentPath === PATHS.landing.base ||
                         currentPath === PATHS.home;
    
    if (!isOnAuthRoute) {
      // Use replace to avoid polluting history stack
      window.location.replace(PATHS.auth.login);
    }
  }

  return response;
}; 