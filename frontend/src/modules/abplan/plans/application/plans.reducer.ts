import { createReducer } from "@reduxjs/toolkit";
import { actions } from "./plans.actions";

export type PlansState = {
  plans: any[];
};

const initialState: PlansState = {
  plans: [],
};

export const plansReducer = createReducer(initialState, builder => {
  builder
    .addCase(actions.upload, (state, action) => {
      state.plans = action.payload || [];
    })
    .addCase(actions.analyze, (state, action) => {
      state.plans = action.payload || [];
    })
    .addCase(actions.read, (state, action) => {
      state.plans = action.payload || [];
    })
    .addCase(actions.delete, (state, action) => {
      state.plans = action.payload || [];
    });
});
