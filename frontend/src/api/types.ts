export type Owner = {
  id: string;
  name: string;
  email: string;
};

export type EventType = {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
};

export type Slot = {
  eventTypeId: string;
  startsAt: string;
  endsAt: string;
  available: boolean;
};

export type Guest = {
  name: string;
  email: string;
};

export type Booking = {
  id: string;
  eventTypeId: string;
  eventTypeTitle: string;
  guest: Guest;
  startsAt: string;
  endsAt: string;
  createdAt: string;
};

export type CreateEventTypeRequest = {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
};

export type CreateBookingRequest = {
  eventTypeId: string;
  startsAt: string;
  guestName: string;
  guestEmail: string;
};

export type ErrorCode =
  | 'validationFailed'
  | 'eventTypeNotFound'
  | 'slotUnavailable'
  | 'bookingWindowExceeded'
  | 'duplicateEventType';

export type ApiError = {
  code: ErrorCode;
  message: string;
};

export class ApiClientError extends Error {
  status: number;
  code?: ErrorCode;

  constructor(status: number, message: string, code?: ErrorCode) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
  }
}
