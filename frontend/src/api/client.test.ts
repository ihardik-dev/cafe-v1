import { describe, expect, it, beforeEach } from 'vitest';
import { apiClient, AUTH_TOKEN_KEY } from './client';
import { ApiError } from '../types/api';

describe('apiClient and ApiError normalization', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('constructs ApiError with statusCode, message, and fieldErrors map', () => {
    const error = new ApiError(400, 'Validation failed', [
      { field: 'email', message: 'Invalid email address' },
      { field: 'password', message: 'Password is too short' },
    ]);

    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('Validation failed');
    expect(error.fieldErrors).toEqual({
      email: 'Invalid email address',
      password: 'Password is too short',
    });
  });

  it('stores and retrieves the auth token key', () => {
    localStorage.setItem(AUTH_TOKEN_KEY, 'test-jwt-token');
    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBe('test-jwt-token');
  });

  it('client exists and has interceptors defined', () => {
    expect(apiClient).toBeDefined();
    expect(apiClient.interceptors.request).toBeDefined();
    expect(apiClient.interceptors.response).toBeDefined();
  });
});
