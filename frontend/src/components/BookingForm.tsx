import { Button, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconCalendarCheck } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { FormEvent, useState } from 'react';
import type { Slot } from '../api/types';

type BookingFormProps = {
  selectedSlot?: Slot;
  isSubmitting: boolean;
  onSubmit: (values: { guestName: string; guestEmail: string }) => void;
};

export function BookingForm({ selectedSlot, isSubmitting, onSubmit }: BookingFormProps) {
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({ guestName: guestName.trim(), guestEmail: guestEmail.trim() });
  }

  return (
    <Paper withBorder radius="md" p="lg">
      <form onSubmit={handleSubmit}>
        <Stack>
          <Stack gap={4}>
            <Title order={3}>Данные гостя</Title>
            <Text c="dimmed" size="sm">
              {selectedSlot
                ? dayjs(selectedSlot.startsAt).format('DD MMMM YYYY, HH:mm')
                : 'Выберите свободное время слева'}
            </Text>
          </Stack>
          <TextInput
            label="Имя"
            placeholder="Анна Иванова"
            value={guestName}
            onChange={(event) => setGuestName(event.currentTarget.value)}
            required
          />
          <TextInput
            label="Email"
            placeholder="anna@example.com"
            type="email"
            value={guestEmail}
            onChange={(event) => setGuestEmail(event.currentTarget.value)}
            required
          />
          <Button
            type="submit"
            color="dark"
            leftSection={<IconCalendarCheck size={18} />}
            loading={isSubmitting}
            disabled={!selectedSlot}
          >
            Записаться
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
