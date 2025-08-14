import type { Dependencies } from '../reduxStore';
import { initReduxStore } from '../reduxStore';
import { AuthProvider } from '@/modules/auth/infrastructure/AuthProvider';

export type TestDependencies = Partial<Dependencies>;

export const initTestReduxStore = (dependencies: TestDependencies) => {
  const defaultDependencies: Dependencies = {
    authProvider: new AuthProvider(),
  };

  return initReduxStore({ ...defaultDependencies, ...dependencies });
};
