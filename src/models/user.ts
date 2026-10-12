export enum UserRole {
  ADMIN = "ADMIN",
  EMPLOYEE = "EMPLOYEE",
}

export interface user {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    password_hash: string;
    created_at: Date;
    is_active: boolean;
}

export type PublicUser = Omit<user, "password_hash">;