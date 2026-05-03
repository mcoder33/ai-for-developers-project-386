# Call Booking Domain

The application has no authentication and no account management. It works with one predefined calendar owner and public guests.

## Roles

- Owner: predefined profile used by the admin area. The owner creates event types and views upcoming bookings.
- Guest: public visitor who chooses an event type, picks a free slot in the next 14 days, and creates a booking.

## Entities

- Owner: `id`, `name`, `email`.
- Event type: `id`, `title`, `description`, `durationMinutes`.
- Slot: `eventTypeId`, `startsAt`, `endsAt`, `available`.
- Guest: `name`, `email`.
- Booking: `id`, `eventTypeId`, `eventTypeTitle`, `guest`, `startsAt`, `endsAt`, `createdAt`.

## Business Rules

- Slots are shown for 14 days starting from the current date.
- The product scenario uses 30-minute visible slots.
- A guest can book only a free slot returned by the public slots endpoint.
- Two bookings cannot exist for the same start time, even when they belong to different event types.
- Upcoming owner bookings are returned in one list across all event types.
- The server rejects unknown event types, occupied slots, invalid input, and requested times outside the booking window.

## API Contract Coverage

- Guest can list public event types: `GET /public/event-types`.
- Guest can inspect one event type: `GET /public/event-types/{eventTypeId}`.
- Guest can view slots for the next 14 days: `GET /public/event-types/{eventTypeId}/slots`.
- Guest can create a booking: `POST /public/bookings`.
- Owner can read the predefined profile: `GET /owner/profile`.
- Owner can list and create event types: `GET /owner/event-types`, `POST /owner/event-types`.
- Owner can view upcoming meetings: `GET /owner/bookings/upcoming`.
