import { createAction } from "@reduxjs/toolkit";

enum Types {
  UPLOAD_PLAN = 'plans/uploadPlan',
  ANALYZE = 'plans/analyze',
  READ = 'plans/read',
  DELETE = 'plans/delete',
}

export const actions = {
  upload: createAction(Types.UPLOAD_PLAN),
  analyze: createAction(Types.ANALYZE),
  read: createAction(Types.READ),
  delete: createAction(Types.DELETE),
};
