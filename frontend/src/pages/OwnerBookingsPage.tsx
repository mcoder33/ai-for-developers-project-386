import { Badge, Paper, Stack, Table, Text } from '@mantine/core';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { Booking } from '../api/types';
import { EmptyState } from '../components/EmptyState';
import { ErrorNotice } from '../components/ErrorNotice';
import { PageHeader } from '../components/PageHeader';

export function OwnerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listUpcomingBookings()
      .then(setBookings)
      .catch((reason) => setError(reason.message))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <Stack>
      <PageHeader
        title="Предстоящие встречи"
        description="Единый список будущих бронирований по всем типам событий, отсортированный по времени."
      />

      {error && <ErrorNotice message={error} />}

      {!isLoading && bookings.length === 0 && !error && (
        <EmptyState title="Встреч пока нет" description="Когда гость забронирует слот, запись появится в этом списке." />
      )}

      {bookings.length > 0 && (
        <Paper withBorder radius="md">
          <Table.ScrollContainer minWidth={760}>
            <Table verticalSpacing="md">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Дата и время</Table.Th>
                  <Table.Th>Тип события</Table.Th>
                  <Table.Th>Гость</Table.Th>
                  <Table.Th>Email</Table.Th>
                  <Table.Th>Статус</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {bookings.map((booking) => (
                  <Table.Tr key={booking.id}>
                    <Table.Td>
                      <Stack gap={2}>
                        <Text fw={600}>{dayjs(booking.startsAt).format('DD MMM YYYY')}</Text>
                        <Text c="dimmed" size="sm">
                          {dayjs(booking.startsAt).format('HH:mm')} - {dayjs(booking.endsAt).format('HH:mm')}
                        </Text>
                      </Stack>
                    </Table.Td>
                    <Table.Td>{booking.eventTypeTitle}</Table.Td>
                    <Table.Td>{booking.guest.name}</Table.Td>
                    <Table.Td>{booking.guest.email}</Table.Td>
                    <Table.Td>
                      <Badge color="teal" variant="light">
                        Запланирована
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Paper>
      )}
    </Stack>
  );
}
