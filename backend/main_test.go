package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestCreateBookingRejectsOccupiedSlot(t *testing.T) {
	server := newTestServer()
	startsAt := "2026-05-04T09:00:00Z"

	createBooking(t, server, startsAt, http.StatusCreated)
	createBooking(t, server, startsAt, http.StatusConflict)
}

func TestCreateBookingRejectsOverlappingSlotAcrossEventTypes(t *testing.T) {
	server := newTestServer()

	createBookingForEventType(t, server, "consultation", "2026-05-04T09:00:00Z", http.StatusCreated)

	body := map[string]any{
		"eventTypeId": "intro-call",
		"startsAt":    "2026-05-04T09:30:00Z",
		"guestName":   "Second Guest",
		"guestEmail":  "second@example.com",
	}
	recorder := postJSON(server, "/public/bookings", body)
	if recorder.Code != http.StatusConflict {
		t.Fatalf("expected status %d, got %d: %s", http.StatusConflict, recorder.Code, recorder.Body.String())
	}

	var apiErr APIError
	if err := json.Unmarshal(recorder.Body.Bytes(), &apiErr); err != nil {
		t.Fatal(err)
	}
	if apiErr.Code != "slotUnavailable" {
		t.Fatalf("expected slotUnavailable, got %q", apiErr.Code)
	}
}

func TestCreateEventTypeRejectsDuplicateID(t *testing.T) {
	server := newTestServer()

	body := map[string]any{
		"id":              "intro-call",
		"title":           "Duplicate",
		"description":     "Should fail",
		"durationMinutes": 30,
	}
	recorder := postJSON(server, "/owner/event-types", body)

	if recorder.Code != http.StatusConflict {
		t.Fatalf("expected status %d, got %d: %s", http.StatusConflict, recorder.Code, recorder.Body.String())
	}
}

func TestListSlotsMarksBookedTimeUnavailable(t *testing.T) {
	server := newTestServer()

	createBooking(t, server, "2026-05-04T09:00:00Z", http.StatusCreated)

	request := httptest.NewRequest(http.MethodGet, "/public/event-types/intro-call/slots", nil)
	recorder := httptest.NewRecorder()
	server.ServeHTTP(recorder, request)
	if recorder.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d: %s", http.StatusOK, recorder.Code, recorder.Body.String())
	}

	var slots []Slot
	if err := json.Unmarshal(recorder.Body.Bytes(), &slots); err != nil {
		t.Fatal(err)
	}

	for _, slot := range slots {
		if slot.StartsAt.Equal(time.Date(2026, 5, 4, 9, 0, 0, 0, time.UTC)) && slot.Available {
			t.Fatal("expected booked slot to be unavailable")
		}
	}
}

func newTestServer() http.Handler {
	now := func() time.Time {
		return time.Date(2026, 5, 3, 8, 0, 0, 0, time.UTC)
	}
	return NewServer(NewStore(now))
}

func createBooking(t *testing.T, server http.Handler, startsAt string, expectedStatus int) {
	t.Helper()
	createBookingForEventType(t, server, "intro-call", startsAt, expectedStatus)
}

func createBookingForEventType(t *testing.T, server http.Handler, eventTypeID string, startsAt string, expectedStatus int) {
	t.Helper()
	body := map[string]any{
		"eventTypeId": eventTypeID,
		"startsAt":    startsAt,
		"guestName":   "Guest",
		"guestEmail":  "guest@example.com",
	}
	recorder := postJSON(server, "/public/bookings", body)
	if recorder.Code != expectedStatus {
		t.Fatalf("expected status %d, got %d: %s", expectedStatus, recorder.Code, recorder.Body.String())
	}
}

func postJSON(server http.Handler, path string, body map[string]any) *httptest.ResponseRecorder {
	payload, err := json.Marshal(body)
	if err != nil {
		panic(err)
	}

	request := httptest.NewRequest(http.MethodPost, path, bytes.NewReader(payload))
	request.Header.Set("Content-Type", "application/json")
	recorder := httptest.NewRecorder()
	server.ServeHTTP(recorder, request)
	return recorder
}
