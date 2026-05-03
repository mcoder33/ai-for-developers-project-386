import {
  Button,
  Group,
  NumberInput,
  Paper,
  SimpleGrid,
  Stack,
  Table,
  TextInput,
  Textarea,
} from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { FormEvent, useEffect, useState } from 'react';
import { api } from '../api/client';
import { ApiClientError, type EventType } from '../api/types';
import { EmptyState } from '../components/EmptyState';
import { ErrorNotice } from '../components/ErrorNotice';
import { PageHeader } from '../components/PageHeader';

export function OwnerEventTypesPage() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [id, setId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number | string>(30);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listOwnerEventTypes()
      .then(setEventTypes)
      .catch((reason) => setError(reason.message))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      const created = await api.createEventType({
        id: id.trim(),
        title: title.trim(),
        description: description.trim(),
        durationMinutes: Number(durationMinutes),
      });

      setEventTypes((current) => [...current, created]);
      setId('');
      setTitle('');
      setDescription('');
      setDurationMinutes(30);
    } catch (reason) {
      if (reason instanceof ApiClientError && reason.code === 'duplicateEventType') {
        setFormError('Тип события с таким id уже существует.');
      } else if (reason instanceof Error) {
        setFormError(reason.message);
      } else {
        setFormError('Не удалось создать тип события.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Stack>
      <PageHeader
        title="Типы событий"
        description="Создавайте форматы звонков, которые гости смогут выбрать на публичной странице бронирования."
      />

      {error && <ErrorNotice message={error} />}

      <Paper withBorder radius="md" p="lg">
        <form onSubmit={handleSubmit}>
          <Stack>
            {formError && <ErrorNotice title="Не удалось создать тип события" message={formError} />}
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <TextInput label="ID" placeholder="intro-call" value={id} onChange={(event) => setId(event.currentTarget.value)} required />
              <TextInput label="Название" placeholder="Вводный звонок" value={title} onChange={(event) => setTitle(event.currentTarget.value)} required />
            </SimpleGrid>
            <Textarea
              label="Описание"
              placeholder="Короткое описание для гостя"
              value={description}
              onChange={(event) => setDescription(event.currentTarget.value)}
              autosize
              minRows={2}
            />
            <Group align="flex-end">
              <NumberInput
                label="Длительность, минут"
                min={1}
                value={durationMinutes}
                onChange={setDurationMinutes}
                required
              />
              <Button type="submit" color="dark" leftSection={<IconPlus size={18} />} loading={isSubmitting}>
                Создать
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>

      {!isLoading && eventTypes.length === 0 && !error && (
        <EmptyState title="Типы событий не созданы" description="Добавьте первый формат встречи через форму выше." />
      )}

      {eventTypes.length > 0 && (
        <Paper withBorder radius="md">
          <Table.ScrollContainer minWidth={640}>
            <Table verticalSpacing="md">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>ID</Table.Th>
                  <Table.Th>Название</Table.Th>
                  <Table.Th>Описание</Table.Th>
                  <Table.Th>Длительность</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {eventTypes.map((eventType) => (
                  <Table.Tr key={eventType.id}>
                    <Table.Td>{eventType.id}</Table.Td>
                    <Table.Td>{eventType.title}</Table.Td>
                    <Table.Td>{eventType.description}</Table.Td>
                    <Table.Td>{eventType.durationMinutes} мин</Table.Td>
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
