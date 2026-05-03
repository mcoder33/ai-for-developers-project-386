import { Badge, Button, Group, Loader, Paper, Stack, Text, Title } from '@mantine/core';
import { IconArrowLeft, IconClock } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { ApiClientError, type EventType, type Slot } from '../api/types';
import { BookingForm } from '../components/BookingForm';
import { EmptyState } from '../components/EmptyState';
import { ErrorNotice } from '../components/ErrorNotice';
import { PageHeader } from '../components/PageHeader';
import { SlotPicker } from '../components/SlotPicker';

export function EventTypeBookingPage() {
  const { eventTypeId } = useParams<{ eventTypeId: string }>();
  const navigate = useNavigate();
  const [eventType, setEventType] = useState<EventType | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventTypeId) {
      return;
    }

    let ignore = false;

    Promise.all([api.getPublicEventType(eventTypeId), api.listSlots(eventTypeId)])
      .then(([eventTypeData, slotData]) => {
        if (!ignore) {
          setEventType(eventTypeData);
          setSlots(slotData);
        }
      })
      .catch((reason) => {
        if (!ignore) {
          setError(reason.message);
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [eventTypeId]);

  async function handleBookingSubmit(values: { guestName: string; guestEmail: string }) {
    if (!eventTypeId || !selectedSlot) {
      return;
    }

    setIsSubmitting(true);
    setBookingError(null);

    try {
      const booking = await api.createBooking({
        eventTypeId,
        startsAt: selectedSlot.startsAt,
        guestName: values.guestName,
        guestEmail: values.guestEmail,
      });

      navigate('/booking-success', {
        state: { booking },
      });
    } catch (reason) {
      if (reason instanceof ApiClientError && reason.code === 'slotUnavailable') {
        setBookingError('Это время уже занято. Выберите другой свободный слот.');
      } else if (reason instanceof Error) {
        setBookingError(reason.message);
      } else {
        setBookingError('Не удалось создать бронирование.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <Stack align="center" py="xl">
        <Loader color="dark" />
      </Stack>
    );
  }

  if (error || !eventType) {
    return (
      <Stack>
        <Button component={Link} to="/" variant="subtle" leftSection={<IconArrowLeft size={17} />} w="fit-content">
          Назад
        </Button>
        <ErrorNotice title="Тип события не найден" message={error ?? 'Проверьте ссылку и попробуйте снова.'} />
      </Stack>
    );
  }

  return (
    <Stack>
      <PageHeader
        title={eventType.title}
        description={eventType.description}
        actions={
          <Button component={Link} to="/" variant="subtle" leftSection={<IconArrowLeft size={17} />}>
            Назад
          </Button>
        }
      />

      <Paper withBorder radius="md" p="md">
        <Group gap="sm">
          <Badge color="teal" variant="light" leftSection={<IconClock size={13} />}>
            {eventType.durationMinutes} мин
          </Badge>
          <Text c="dimmed">Свободные интервалы формируются на ближайшие 14 дней.</Text>
        </Group>
      </Paper>

      {bookingError && <ErrorNotice message={bookingError} />}

      <div className="booking-grid">
        <Stack>
          <Title order={2}>Свободное время</Title>
          {slots.length === 0 ? (
            <EmptyState title="Нет доступных слотов" description="Попробуйте вернуться позже или выбрать другой тип встречи." />
          ) : (
            <SlotPicker slots={slots} selectedStartsAt={selectedSlot?.startsAt} onSelect={setSelectedSlot} />
          )}
        </Stack>
        <BookingForm selectedSlot={selectedSlot} isSubmitting={isSubmitting} onSubmit={handleBookingSubmit} />
      </div>
    </Stack>
  );
}
