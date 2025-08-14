import { AppState } from "@/store/appState";

export const plansSelectors = {
  read: (state: AppState) => state.plans.plans,
};
