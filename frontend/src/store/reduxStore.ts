import {
  Action,
  Store,
  ThunkAction,
  ThunkDispatch,
  UnknownAction,
  configureStore,
} from '@reduxjs/toolkit';
import {
  useDispatch as useReduxDispatch,
  useSelector as useReduxSelector,
  TypedUseSelectorHook,
} from 'react-redux';

import type { AppState } from '@/store/appState';

import { authReducer } from '@/modules/auth/application/auth.reducer';
import { AuthProvider } from '@/modules/auth/infrastructure/AuthProvider';
import { plansReducer } from '@/modules/abplan/plans/application/plans.reducer';
import { PlansProvider } from '@/modules/abplan/plans/infrastructure/PlansProvider';
import { projectsReducer } from '@/modules/abplan/projects/application/projects.reducer';
import { ProjectsProvider } from '@/modules/abplan/projects/infrastructure/ProjectsProvider';
import { equipmentsReducer } from '@/modules/abplan/equipments/application/equipments.reducer';

export type Dependencies = {
  authProvider: AuthProvider;
  plansProvider: PlansProvider;
  projectsProvider: ProjectsProvider;
};

export const initReduxStore = (dependencies: Dependencies) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      plans: plansReducer,
      projects: projectsReducer,
      equipments: equipmentsReducer,
    },
    devTools: true,
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        thunk: {
          extraArgument: dependencies,
        },
      }),
  });
};

export const reduxStore = initReduxStore({
  authProvider: new AuthProvider(),
  plansProvider: new PlansProvider(),
  projectsProvider: new ProjectsProvider(),
});

export type AppThunk<R = unknown> = ThunkAction<
  R,
  AppState,
  Dependencies,
  Action<string>
>;

export type AppDispatch = ThunkDispatch<AppState, Dependencies, UnknownAction>;

export type ReduxStore = Omit<Store<AppState, UnknownAction>, 'dispatch'> & {
  dispatch: AppDispatch;
};

export const useAppDispatch = () => useReduxDispatch<AppDispatch>();

export const useAppSelector: TypedUseSelectorHook<AppState> = useReduxSelector;
