import { PlansState } from '@/modules/abplan/plans/application/plans.reducer';
import { AuthState } from '@/modules/auth/application/auth.reducer';
import { ProjectsState } from '@/modules/abplan/projects/application/projects.reducer';
import { EquipmentsState } from '@/modules/abplan/equipments/application/equipments.reducer';

export type AppState = {
  auth: AuthState;
  plans: PlansState;
  projects: ProjectsState;
  equipments: EquipmentsState;
};
