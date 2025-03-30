// types/api.ts

import { User } from './User';

export interface ApiSuccess<T> {
  data: T;
}

export interface ApiError {
  message: string;
}

// שימוש נפוץ
export interface AuthResponse {
  user: User;
  token: string;
}
