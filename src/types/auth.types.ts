export interface User {
  id: string;
  firebase_uid: string;
  name: string;
  email: string;
  phone: string;
  dob?: string;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
