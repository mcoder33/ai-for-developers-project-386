import { Button, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { IconArrowLeft, IconCircleCheck } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { Link, useLocation } from 'react-router-dom';
import type { Booking } from '../api/types';

export function BookingSuccessPage() {
  const location = useLocation();
  const booking = location.state?.booking as Booking | undefined;

  return (
    <Paper withBorder radius="md" p="xl">
      <Stack gap="lg">
        <Group gap="sm">
          <IconCircleCheck size={34} color="#2f9e44" />
          <Title order={1}>Запись создана</Title>
        </Group>

        {booking ? (
          <Stack gap={4}>
            <Text size="lg" fw={700}>
              {booking.eventTypeTitle}
            </Text>
            <Text c="dimmed">
              {dayjs(booking.startsAt).format('DD MMMM YYYY, HH:mm')} - {dayjs(booking.endsAt).format('HH:mm')}
            </Text>
            <Text c="dimmed">
              {booking.guest.name}, {booking.guest.email}
            </Text>
          </Stack>
        ) : (
          <Text c="dimmed">Бронирование подтверждено.</Text>
        )}

        <Button component={Link} to="/" color="dark" leftSection={<IconArrowLeft size={17} />} w="fit-content">
          К списку встреч
        </Button>
      </Stack>
    </Paper>
  );
}
