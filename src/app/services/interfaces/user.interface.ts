export interface Role {
  id: number;
  name: string;
  description: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  enabled: boolean;
  roles: Role[];
}