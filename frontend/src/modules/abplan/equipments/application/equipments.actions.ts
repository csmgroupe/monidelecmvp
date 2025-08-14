import { createAction } from '@reduxjs/toolkit';
import type { Equipment } from '@/features/abplan/types';

export enum EquipmentsActionTypes {
  SET_ALL = 'equipments/setAll',
  ADD_ONE = 'equipments/addOne',
  UPDATE_QTY = 'equipments/updateQty',
  REMOVE_ONE = 'equipments/removeOne',
}

export const equipmentsActions = {
  setAll: createAction<{ projectId: string; equipments: Equipment[] }>(EquipmentsActionTypes.SET_ALL),
  addOne: createAction<{ projectId: string; equipment: Equipment }>(EquipmentsActionTypes.ADD_ONE),
  updateQty: createAction<{ projectId: string; id: string; delta: number }>(EquipmentsActionTypes.UPDATE_QTY),
  removeOne: createAction<{ projectId: string; id: string }>(EquipmentsActionTypes.REMOVE_ONE),
}; 