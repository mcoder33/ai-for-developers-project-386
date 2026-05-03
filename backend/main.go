package main

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/mail"
	"os"
	"sort"
	"strings"
	"sync"
	"time"
)

const (
	defaultPort       = "3000"
	bookingWindowDays = 14
	slotStep          = 30 * time.Minute
	workdayStartHour  = 9
	workdayEndHour    = 17
)

type Owner struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

type EventType struct {
	ID              string `json:"id"`
	Title           string `json:"title"`
	Description     string `json:"description"`
	DurationMinutes int    `json:"durationMinutes"`
}

type Slot struct {
	EventTypeID string    `json:"eventTypeId"`
	StartsAt    time.Time `json:"startsAt"`
	EndsAt      time.Time `json:"endsAt"`
	Available   bool      `json:"available"`
}

type Guest struct {
	Name  string `json:"name"`
	Email string `json:"email"`
}

type Booking struct {
	ID             string    `json:"id"`
	EventTypeID    string    `json:"eventTypeId"`
	EventTypeTitle string    `json:"eventTypeTitle"`
	Guest          Guest     `json:"guest"`
	StartsAt       time.Time `json:"startsAt"`
	EndsAt         time.Time `json:"endsAt"`
	CreatedAt      time.Time `json:"createdAt"`
}

type CreateEventTypeRequest struct {
	ID              string `json:"id"`
	Title           string `json:"title"`
	Description     string `json:"description"`
	DurationMinutes int    `json:"durationMinutes"`
}

type CreateBookingRequest struct {
	EventTypeID string    `json:"eventTypeId"`
	StartsAt    time.Time `json:"startsAt"`
	GuestName   string    `json:"guestName"`
	GuestEmail  string    `json:"guestEmail"`
}

type APIError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

type Store struct {
	mu         sync.RWMutex
	owner      Owner
	eventTypes map[string]EventType
	bookings   []Booking
	now        func() time.Time
}

func NewStore(now func() time.Time) *Store {
	if now == nil {
		now = func() time.Time { return time.Now().UTC() }
	}

	store := &Store{
		owner: Owner{
			ID:    "owner-1",
			Name:  "Calendar Owner",
			Email: "owner@example.com",
		},
		eventTypes: make(map[string]EventType),
		now:        now,
	}

	store.eventTypes["intro-call"] = EventType{
		ID:              "intro-call",
		Title:           "Intro call",
		Description:     "A short call to discuss goals and next steps.",
		DurationMinutes: 30,
	}
	store.eventTypes["consultation"] = EventType{
		ID:              "consultation",
		Title:           "Consultation",
		Description:     "A focused consultation for a specific question.",
		DurationMinutes: 60,
	}

	return store
}

type Server struct {
	store *Store
}

func NewServer(store *Store) http.Handler {
	server := &Server{store: store}
	mux := http.NewServeMux()

	mux.HandleFunc("/public/event-types", server.handlePublicEventTypes)
	mux.HandleFunc("/public/event-types/", server.handlePublicEventTypeByID)
	mux.HandleFunc("/public/bookings", server.handlePublicBookings)
	mux.HandleFunc("/owner/profile", server.handleOwnerProfile)
	mux.HandleFunc("/owner/event-types", server.handleOwnerEventTypes)
	mux.HandleFunc("/owner/bookings/upcoming", server.handleUpcomingBookings)

	return cors(mux)
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}

	addr := ":" + port
	log.Printf("call booking API listening on http://localhost%s", addr)
	if err := http.ListenAndServe(addr, NewServer(NewStore(nil))); err != nil {
		log.Fatal(err)
	}
}

func (s *Server) handlePublicEventTypes(w http.ResponseWriter, r *http.Request) {
	if !allowMethod(w, r, http.MethodGet) {
		return
	}

	s.store.mu.RLock()
	eventTypes := sortedEventTypes(s.store.eventTypes)
	s.store.mu.RUnlock()

	writeJSON(w, http.StatusOK, eventTypes)
}

func (s *Server) handlePublicEventTypeByID(w http.ResponseWriter, r *http.Request) {
	path := strings.TrimPrefix(r.URL.Path, "/public/event-types/")
	if path == "" {
		http.NotFound(w, r)
		return
	}

	if strings.HasSuffix(path, "/slots") {
		if !allowMethod(w, r, http.MethodGet) {
			return
		}
		eventTypeID := strings.TrimSuffix(path, "/slots")
		s.handleListSlots(w, strings.TrimSuffix(eventTypeID, "/"))
		return
	}

	if !allowMethod(w, r, http.MethodGet) {
		return
	}
	s.handleGetEventType(w, strings.Trim(path, "/"))
}

func (s *Server) handleGetEventType(w http.ResponseWriter, eventTypeID string) {
	eventType, ok := s.getEventType(eventTypeID)
	if !ok {
		writeError(w, http.StatusNotFound, "eventTypeNotFound", "Event type not found.")
		return
	}

	writeJSON(w, http.StatusOK, eventType)
}

func (s *Server) handleListSlots(w http.ResponseWriter, eventTypeID string) {
	eventType, ok := s.getEventType(eventTypeID)
	if !ok {
		writeError(w, http.StatusNotFound, "eventTypeNotFound", "Event type not found.")
		return
	}

	s.store.mu.RLock()
	bookings := append([]Booking(nil), s.store.bookings...)
	s.store.mu.RUnlock()

	writeJSON(w, http.StatusOK, buildSlots(eventType, bookings, s.store.now()))
}

func (s *Server) handlePublicBookings(w http.ResponseWriter, r *http.Request) {
	if !allowMethod(w, r, http.MethodPost) {
		return
	}

	var request CreateBookingRequest
	if err := decodeJSON(r, &request); err != nil {
		writeError(w, http.StatusBadRequest, "validationFailed", "Request body must be valid JSON.")
		return
	}

	booking, status, apiErr := s.createBooking(request)
	if apiErr != nil {
		writeError(w, status, apiErr.Code, apiErr.Message)
		return
	}

	writeJSON(w, http.StatusCreated, booking)
}

func (s *Server) handleOwnerProfile(w http.ResponseWriter, r *http.Request) {
	if !allowMethod(w, r, http.MethodGet) {
		return
	}

	s.store.mu.RLock()
	owner := s.store.owner
	s.store.mu.RUnlock()

	writeJSON(w, http.StatusOK, owner)
}

func (s *Server) handleOwnerEventTypes(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		s.store.mu.RLock()
		eventTypes := sortedEventTypes(s.store.eventTypes)
		s.store.mu.RUnlock()
		writeJSON(w, http.StatusOK, eventTypes)
	case http.MethodPost:
		var request CreateEventTypeRequest
		if err := decodeJSON(r, &request); err != nil {
			writeError(w, http.StatusBadRequest, "validationFailed", "Request body must be valid JSON.")
			return
		}

		eventType, status, apiErr := s.createEventType(request)
		if apiErr != nil {
			writeError(w, status, apiErr.Code, apiErr.Message)
			return
		}

		writeJSON(w, http.StatusCreated, eventType)
	default:
		methodNotAllowed(w)
	}
}

func (s *Server) handleUpcomingBookings(w http.ResponseWriter, r *http.Request) {
	if !allowMethod(w, r, http.MethodGet) {
		return
	}

	now := s.store.now()
	s.store.mu.RLock()
	bookings := make([]Booking, 0, len(s.store.bookings))
	for _, booking := range s.store.bookings {
		if booking.StartsAt.After(now) || booking.StartsAt.Equal(now) {
			bookings = append(bookings, booking)
		}
	}
	s.store.mu.RUnlock()

	sort.Slice(bookings, func(i, j int) bool {
		return bookings[i].StartsAt.Before(bookings[j].StartsAt)
	})

	writeJSON(w, http.StatusOK, bookings)
}

func (s *Server) getEventType(eventTypeID string) (EventType, bool) {
	s.store.mu.RLock()
	eventType, ok := s.store.eventTypes[eventTypeID]
	s.store.mu.RUnlock()
	return eventType, ok
}

func (s *Server) createEventType(request CreateEventTypeRequest) (EventType, int, *APIError) {
	eventType := EventType{
		ID:              strings.TrimSpace(request.ID),
		Title:           strings.TrimSpace(request.Title),
		Description:     strings.TrimSpace(request.Description),
		DurationMinutes: request.DurationMinutes,
	}

	if eventType.ID == "" || eventType.Title == "" || eventType.DurationMinutes < 1 {
		return EventType{}, http.StatusBadRequest, &APIError{Code: "validationFailed", Message: "Event type id, title, and positive durationMinutes are required."}
	}

	s.store.mu.Lock()
	defer s.store.mu.Unlock()

	if _, exists := s.store.eventTypes[eventType.ID]; exists {
		return EventType{}, http.StatusConflict, &APIError{Code: "duplicateEventType", Message: "Event type with this id already exists."}
	}

	s.store.eventTypes[eventType.ID] = eventType
	return eventType, http.StatusCreated, nil
}

func (s *Server) createBooking(request CreateBookingRequest) (Booking, int, *APIError) {
	guestName := strings.TrimSpace(request.GuestName)
	guestEmail := strings.TrimSpace(request.GuestEmail)
	if request.EventTypeID == "" || request.StartsAt.IsZero() || guestName == "" || !validEmail(guestEmail) {
		return Booking{}, http.StatusBadRequest, &APIError{Code: "validationFailed", Message: "eventTypeId, startsAt, guestName, and a valid guestEmail are required."}
	}

	s.store.mu.Lock()
	defer s.store.mu.Unlock()

	eventType, exists := s.store.eventTypes[request.EventTypeID]
	if !exists {
		return Booking{}, http.StatusNotFound, &APIError{Code: "eventTypeNotFound", Message: "Event type not found."}
	}

	startsAt := request.StartsAt.UTC()
	endsAt := startsAt.Add(time.Duration(eventType.DurationMinutes) * time.Minute)
	slot, ok := findSlot(eventType, startsAt, s.store.bookings, s.store.now())
	if !ok {
		return Booking{}, http.StatusBadRequest, &APIError{Code: "bookingWindowExceeded", Message: "Selected start time is outside the booking window."}
	}
	if !slot.Available {
		return Booking{}, http.StatusConflict, &APIError{Code: "slotUnavailable", Message: "Selected slot is already occupied."}
	}

	booking := Booking{
		ID:             newID(),
		EventTypeID:    eventType.ID,
		EventTypeTitle: eventType.Title,
		Guest:          Guest{Name: guestName, Email: guestEmail},
		StartsAt:       startsAt,
		EndsAt:         endsAt,
		CreatedAt:      s.store.now().UTC(),
	}
	s.store.bookings = append(s.store.bookings, booking)

	return booking, http.StatusCreated, nil
}

func buildSlots(eventType EventType, bookings []Booking, now time.Time) []Slot {
	now = now.UTC()
	duration := time.Duration(eventType.DurationMinutes) * time.Minute
	windowStart := startOfDay(now)
	windowEnd := windowStart.AddDate(0, 0, bookingWindowDays)
	slots := []Slot{}

	for day := windowStart; day.Before(windowEnd); day = day.AddDate(0, 0, 1) {
		for startsAt := day.Add(time.Duration(workdayStartHour) * time.Hour); ; startsAt = startsAt.Add(slotStep) {
			endsAt := startsAt.Add(duration)
			if endsAt.After(day.Add(time.Duration(workdayEndHour) * time.Hour)) {
				break
			}
			if startsAt.Before(now) {
				continue
			}
			slots = append(slots, Slot{
				EventTypeID: eventType.ID,
				StartsAt:    startsAt,
				EndsAt:      endsAt,
				Available:   !overlapsAny(startsAt, endsAt, bookings),
			})
		}
	}

	return slots
}

func findSlot(eventType EventType, startsAt time.Time, bookings []Booking, now time.Time) (Slot, bool) {
	slots := buildSlots(eventType, bookings, now)
	for _, slot := range slots {
		if slot.StartsAt.Equal(startsAt.UTC()) {
			return slot, true
		}
	}

	return Slot{}, false
}

func overlapsAny(startsAt, endsAt time.Time, bookings []Booking) bool {
	for _, booking := range bookings {
		if startsAt.Before(booking.EndsAt) && endsAt.After(booking.StartsAt) {
			return true
		}
	}
	return false
}

func sortedEventTypes(eventTypes map[string]EventType) []EventType {
	result := make([]EventType, 0, len(eventTypes))
	for _, eventType := range eventTypes {
		result = append(result, eventType)
	}
	sort.Slice(result, func(i, j int) bool {
		return result[i].ID < result[j].ID
	})
	return result
}

func startOfDay(t time.Time) time.Time {
	year, month, day := t.Date()
	return time.Date(year, month, day, 0, 0, 0, 0, time.UTC)
}

func validEmail(value string) bool {
	_, err := mail.ParseAddress(value)
	return err == nil
}

func newID() string {
	var bytes [16]byte
	if _, err := rand.Read(bytes[:]); err != nil {
		return fmt.Sprintf("booking-%d", time.Now().UnixNano())
	}
	return "booking-" + hex.EncodeToString(bytes[:])
}

func decodeJSON(r *http.Request, target any) error {
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(target); err != nil {
		return err
	}
	if err := decoder.Decode(&struct{}{}); !errors.Is(err, io.EOF) {
		return errors.New("request body must contain a single JSON value")
	}
	return nil
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(value); err != nil {
		log.Printf("failed to encode response: %v", err)
	}
}

func writeError(w http.ResponseWriter, status int, code string, message string) {
	writeJSON(w, status, APIError{Code: code, Message: message})
}

func allowMethod(w http.ResponseWriter, r *http.Request, method string) bool {
	if r.Method == method {
		return true
	}
	methodNotAllowed(w)
	return false
}

func methodNotAllowed(w http.ResponseWriter) {
	w.Header().Set("Allow", "GET, POST, OPTIONS")
	writeError(w, http.StatusMethodNotAllowed, "validationFailed", "Method not allowed.")
}

func cors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}
