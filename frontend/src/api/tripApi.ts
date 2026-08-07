import axios from 'axios';
import type { TripRequest, TripResponse, ErrorResponse } from '../types/trip';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function generateTrip(data: TripRequest): Promise<TripResponse> {
  try {
    const response = await api.post<TripResponse>('/api/trip/', data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const errorData = error.response.data as ErrorResponse;
      throw new Error(
        errorData.message || 'Failed to generate trip. Please try again.'
      );
    }
    throw new Error('Network error. Please check your connection and try again.');
  }
}
