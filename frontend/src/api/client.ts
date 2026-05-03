import type {
  Booking,
  CreateBookingRequest,
  CreateEventTypeRequest,
  EventType,
  Owner,
  Slot,
} from './types';
import { ApiClientError } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4010';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    ...init,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    let code;

    try {
      const body = await response.json();
      message = body.message ?? body.error?.message ?? message;
      code = body.code ?? body.error?.code;
    } catch {
      // Keep the generic message when the server returns an empty or non-JSON body.
    }

    throw new ApiClientError(response.status, message, code);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  listPublicEventTypes: () => request<EventType[]>('/public/event-types'),
  getPublicEventType: (eventTypeId: string) =>
    request<EventType>(`/public/event-types/${encodeURIComponent(eventTypeId)}`),
  listSlots: (eventTypeId: string) =>
    request<Slot[]>(`/public/event-types/${encodeURIComponent(eventTypeId)}/slots`),
  createBooking: (payload: CreateBookingRequest) =>
    request<Booking>('/public/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getOwner: () => request<Owner>('/owner/profile'),
  listOwnerEventTypes: () => request<EventType[]>('/owner/event-types'),
  createEventType: (payload: CreateEventTypeRequest) =>
    request<EventType>('/owner/event-types', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  listUpcomingBookings: () => request<Booking[]>('/owner/bookings/upcoming'),
};
