export const PATHS = {
  home: '/',
  landing: {
    base: '/landing',
  },
  auth: {
    base: '/auth',
    login: '/auth/login',
    register: '/auth/register',
    confirmResetPassword: '/auth/confirm-reset-password',
    resetPassword: '/auth/reset-password',
  },
  updatePassword: {
    base: '/update-password',
  },
  dashboard: {
    base: '/dashboard',
  },
  heatPumpCalculator: {
    base: '/tools/heat-pump-calculator',
  },
  pricing: {
    base: '/pricing',
  },
  settings: {
    base: '/settings',
  },
  errors: {
    notFound: '/404',
    unauthorized: '/403',
  },
  abplan: {
    base: '/projects',
    list: '/projects',
    new: '/projects/new',
    project: (id: string) => `/projects/${id}`,
    steps: {
      info: (id: string) => `/projects/${id}/info`,
      plan: (id: string) => `/projects/${id}/plan`,
      rooms: (id: string) => `/projects/${id}/rooms`,
      equipment: (id: string) => `/projects/${id}/equipment`,
      options: (id: string) => `/projects/${id}/options`,
      summary: (id: string) => `/projects/${id}/summary`,
      dimensioning: (id: string) => `/projects/${id}/dimensioning`,
      quote: (id: string) => `/projects/${id}/quote`,
    },
  },
};
