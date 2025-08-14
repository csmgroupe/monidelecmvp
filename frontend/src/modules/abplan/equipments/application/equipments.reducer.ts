import { createReducer } from '@reduxjs/toolkit';
import type { Equipment } from '@/features/abplan/types';
import { equipmentsActions } from './equipments.actions';

export type EquipmentsState = {
  [projectId: string]: Equipment[];
};

const initialState: EquipmentsState = {};

// helper to dedup list by roomId+name
const dedupList = (list: Equipment[]): Equipment[] => {
  const map = new Map<string, Equipment>();
  list.forEach(eq => {
    const key = `${eq.roomId}_${eq.name}`;
    const existing = map.get(key);
    if (existing) {
      existing.quantity += eq.quantity;
    } else {
      map.set(key, { ...eq });
    }
  });
  return Array.from(map.values());
};

export const equipmentsReducer = createReducer(initialState, builder => {
  builder
    .addCase(equipmentsActions.setAll, (state, { payload }) => {
      state[payload.projectId] = dedupList(payload.equipments);
    })
    .addCase(equipmentsActions.addOne, (state, { payload }) => {
      if (!state[payload.projectId]) state[payload.projectId] = [];
      const existing = state[payload.projectId].find(e => e.name === payload.equipment.name && e.roomId === payload.equipment.roomId);
      if (existing) {
        existing.quantity += payload.equipment.quantity;
      } else {
        state[payload.projectId].push(payload.equipment);
      }
    })
    .addCase(equipmentsActions.updateQty, (state, { payload }) => {
      const list = state[payload.projectId];
      if (!list) return;
      state[payload.projectId] = list
        .map(e => {
          if (e.id !== payload.id) return e;
          const newQty = Math.max(0, (e.quantity ?? 0) + payload.delta);
          return { ...e, quantity: newQty } as Equipment;
        })
        .filter(e => e.quantity > 0);
    })
    .addCase(equipmentsActions.removeOne, (state, { payload }) => {
      const list = state[payload.projectId];
      if (!list) return;
      state[payload.projectId] = list.filter(e => e.id !== payload.id);
    });
}); 