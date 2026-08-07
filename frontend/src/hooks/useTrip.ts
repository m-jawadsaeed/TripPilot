import { useMutation } from '@tanstack/react-query';
import { generateTrip } from '../api/tripApi';
import type { TripRequest, TripResponse } from '../types/trip';

export function useTrip() {
  return useMutation<TripResponse, Error, TripRequest>({
    mutationFn: generateTrip,
  });
}
