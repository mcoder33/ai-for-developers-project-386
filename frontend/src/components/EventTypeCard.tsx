import { Badge, Button, Card, Group, Stack, Text, Title } from '@mantine/core';
import { IconArrowRight, IconClock } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import type { EventType } from '../api/types';

type EventTypeCardProps = {
  eventType: EventType;
};

export function EventTypeCard({ eventType }: EventTypeCardProps) {
  return (
    <Card withBorder radius="md" p="lg">
      <Stack gap="md" h="100%">
        <Stack gap={6}>
          <Group justify="space-between" align="flex-start" gap="sm">
            <Title order={3}>{eventType.title}</Title>
            <Badge color="teal" variant="light" leftSection={<IconClock size={13} />}>
              {eventType.durationMinutes} мин
            </Badge>
          </Group>
          <Text c="dimmed">{eventType.description}</Text>
        </Stack>
        <Button
          component={Link}
          to={`/event-types/${encodeURIComponent(eventType.id)}`}
          aria-label={`Выбрать время: ${eventType.title}`}
          rightSection={<IconArrowRight size={17} />}
          mt="auto"
          color="dark"
        >
          Выбрать время
        </Button>
      </Stack>
    </Card>
  );
}
