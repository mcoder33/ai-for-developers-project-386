import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { BookingSuccessPage } from './pages/BookingSuccessPage';
import { EventTypeBookingPage } from './pages/EventTypeBookingPage';
import { OwnerBookingsPage } from './pages/OwnerBookingsPage';
import { OwnerEventTypesPage } from './pages/OwnerEventTypesPage';
import { PublicEventTypesPage } from './pages/PublicEventTypesPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<PublicEventTypesPage />} />
        <Route path="/event-types/:eventTypeId" element={<EventTypeBookingPage />} />
        <Route path="/booking-success" element={<BookingSuccessPage />} />
        <Route path="/owner/event-types" element={<OwnerEventTypesPage />} />
        <Route path="/owner/bookings" element={<OwnerBookingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
