export interface AuthResponse {
  success: boolean,
  data: {
    name: string,
    email: string,
    role: string
    token:string
  },
}
export interface LoginFormData {
  email: string;
  password: string;
}
export  enum Role{
  ADMIN = "ADMIN",
  PARTNER = "PARTNER"
}
