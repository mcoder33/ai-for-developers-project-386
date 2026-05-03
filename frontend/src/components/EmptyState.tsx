import { Paper, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { IconInbox } from '@tabler/icons-react';

type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <Paper withBorder radius="md" p="xl">
      <Stack align="center" gap="xs">
        <ThemeIcon color="gray" variant="light" size={42} radius="xl">
          <IconInbox size={22} />
        </ThemeIcon>
        <Title order={3}>{title}</Title>
        <Text c="dimmed" ta="center">
          {description}
        </Text>
      </Stack>
    </Paper>
  );
}
