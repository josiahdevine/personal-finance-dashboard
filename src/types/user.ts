// User-related type definitions

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  phoneNumber: string | null;
  role?: string;
  address?: Address;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatarUrl?: string;
  preferences?: {
    theme: 'light' | 'dark' | 'system';
    currency: string;
    notifications: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserProfileData {
  name?: string;
  phone?: string;
  avatarUrl?: string;
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    currency?: string;
    notifications?: boolean;
  };
}

export interface AuthResponse {
  user: UserProfile;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}