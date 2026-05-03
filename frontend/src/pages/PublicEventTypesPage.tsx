import { SimpleGrid, Skeleton, Stack } from '@mantine/core';
import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { EventType } from '../api/types';
import { EmptyState } from '../components/EmptyState';
import { ErrorNotice } from '../components/ErrorNotice';
import { EventTypeCard } from '../components/EventTypeCard';
import { PageHeader } from '../components/PageHeader';

export function PublicEventTypesPage() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    api
      .listPublicEventTypes()
      .then((data) => {
        if (!ignore) {
          setEventTypes(data);
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
  }, []);

  return (
    <Stack>
      <PageHeader
        title="Запись на звонок"
        description="Выберите тип встречи, посмотрите свободные интервалы на ближайшие 14 дней и забронируйте удобное время."
      />

      {error && <ErrorNotice message={error} />}

      {isLoading && (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
          <Skeleton h={190} radius="md" />
          <Skeleton h={190} radius="md" />
          <Skeleton h={190} radius="md" />
        </SimpleGrid>
      )}

      {!isLoading && !error && eventTypes.length === 0 && (
        <EmptyState title="Типы встреч не созданы" description="Владелец календаря пока не добавил доступные форматы звонков." />
      )}

      {!isLoading && !error && eventTypes.length > 0 && (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
          {eventTypes.map((eventType) => (
            <EventTypeCard key={eventType.id} eventType={eventType} />
          ))}
        </SimpleGrid>
      )}
    </Stack>
  );
}
