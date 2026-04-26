export interface Permission {
  id: number;
  permissionName: string;
}

export interface Role {
  id: number;
  roleName: string;
  permissions: Permission[];
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role | string; // Backend might return either Role object or string
  permissions?: Permission[]; // Backend might have permissions at user level
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  role: string;
  password: string;
  confirmPassword: string;
}
