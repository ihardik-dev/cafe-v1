import apiClient from './client';
import type { User } from '../types/api';

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponseData {
  token: string;
  user: User;
}

export interface RegisterResponseData {
  user: User;
}

export interface ProfileResponseData {
  user: User;
}

/**
 * Register a new customer account.
 * POST /api/v1/auth/register
 */
export async function registerCustomer(data: RegisterRequest): Promise<User> {
  const res = await apiClient.post<RegisterResponseData>('/auth/register', data);
  const unwrapped = res as unknown as RegisterResponseData;
  return unwrapped.user;
}

/**
 * Authenticate customer or admin with email and password.
 * POST /api/v1/auth/login
 */
export async function loginCustomer(credentials: LoginRequest): Promise<LoginResponseData> {
  const res = await apiClient.post<LoginResponseData>('/auth/login', credentials);
  const unwrapped = res as unknown as LoginResponseData;
  return unwrapped;
}

/**
 * Logout authenticated user.
 * POST /api/v1/auth/logout
 * Note: Session JWT is discarded client-side; failure is non-blocking.
 */
export async function logoutUser(): Promise<void> {
  try {
    await apiClient.post('/auth/logout');
  } catch {
    // Failure on server logout is non-fatal since JWT is discarded locally
  }
}

/**
 * Get profile of currently authenticated user.
 * GET /api/v1/users/me
 */
export async function getOwnProfile(): Promise<User> {
  const res = await apiClient.get<ProfileResponseData>('/users/me');
  const unwrapped = res as unknown as ProfileResponseData;
  return unwrapped.user;
}

