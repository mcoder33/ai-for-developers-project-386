import { Group, Stack, Text, Title } from '@mantine/core';
import type { ReactNode } from 'react';

type PageHeaderProps = {
  title: string;
  description: string;
  actions?: ReactNode;
};

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <Group justify="space-between" align="flex-start" mb="xl" gap="lg">
      <Stack gap={4} maw={720}>
        <Title order={1}>{title}</Title>
        <Text c="dimmed" size="lg">
          {description}
        </Text>
      </Stack>
      {actions}
    </Group>
  );
}
