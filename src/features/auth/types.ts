export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResult {
  success: boolean;
  message: string;
}