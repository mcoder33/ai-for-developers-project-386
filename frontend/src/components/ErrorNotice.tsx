import { Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

type ErrorNoticeProps = {
  title?: string;
  message: string;
};

export function ErrorNotice({ title = 'Не удалось выполнить запрос', message }: ErrorNoticeProps) {
  return (
    <Alert color="red" variant="light" title={title} icon={<IconAlertCircle size={18} />}>
      {message}
    </Alert>
  );
}
