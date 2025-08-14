export type User = {
  id?: string;
  email: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterCredentials = {
  email: string;
  password: string;
  company: string;
  firstName: string;
  lastName: string;
  siret: string;
};
