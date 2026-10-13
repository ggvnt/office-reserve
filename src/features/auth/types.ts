export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResult {
  success: boolean;
  message: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResult {
  success: boolean;
  message: string;
}