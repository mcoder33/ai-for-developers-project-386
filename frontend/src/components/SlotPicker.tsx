import { Badge, Button, Group, Paper, Stack, Text } from '@mantine/core';
import { IconCalendarTime } from '@tabler/icons-react';
import dayjs from 'dayjs';
import type { Slot } from '../api/types';

type SlotPickerProps = {
  slots: Slot[];
  selectedStartsAt?: string;
  onSelect: (slot: Slot) => void;
};

export function SlotPicker({ slots, selectedStartsAt, onSelect }: SlotPickerProps) {
  const groupedSlots = slots.reduce<Record<string, Slot[]>>((acc, slot) => {
    const day = dayjs(slot.startsAt).format('YYYY-MM-DD');
    acc[day] = [...(acc[day] ?? []), slot];
    return acc;
  }, {});

  return (
    <Stack>
      {Object.entries(groupedSlots).map(([day, daySlots]) => (
        <Paper key={day} withBorder radius="md" p="md">
          <Group justify="space-between" mb="md">
            <Group gap="xs">
              <IconCalendarTime size={18} />
              <Text fw={700}>{dayjs(day).format('DD MMMM, ddd')}</Text>
            </Group>
            <Badge variant="light">{daySlots.filter((slot) => slot.available).length} свободно</Badge>
          </Group>
          <div className="slot-grid">
            {daySlots.map((slot) => {
              const isSelected = slot.startsAt === selectedStartsAt;

              return (
                <Button
                  key={`${slot.eventTypeId}-${slot.startsAt}`}
                  aria-label={`Выбрать слот ${dayjs(slot.startsAt).format('DD MMMM YYYY, HH:mm')}`}
                  variant={isSelected ? 'filled' : 'light'}
                  color={slot.available ? 'teal' : 'gray'}
                  disabled={!slot.available}
                  onClick={() => onSelect(slot)}
                  fullWidth
                >
                  {dayjs(slot.startsAt).format('HH:mm')}
                </Button>
              );
            })}
          </div>
        </Paper>
      ))}
    </Stack>
  );
}
