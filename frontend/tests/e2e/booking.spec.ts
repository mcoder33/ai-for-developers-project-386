import { expect, test } from '@playwright/test';

test('guest books an available event slot and owner sees the booking', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Запись на звонок' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Intro call' })).toBeVisible();

  await page.getByRole('link', { name: 'Выбрать время: Intro call' }).click();

  await expect(page.getByRole('heading', { name: 'Intro call' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Свободное время' })).toBeVisible();

  await page.getByRole('button', { name: /^Выбрать слот/ }).first().click();
  await page.getByLabel('Имя').fill('Анна Иванова');
  await page.getByLabel('Email').fill('anna@example.com');
  await page.getByRole('button', { name: 'Записаться' }).click();

  await expect(page.getByRole('heading', { name: 'Запись создана' })).toBeVisible();
  await expect(page.getByText('Intro call')).toBeVisible();
  await expect(page.getByText('Анна Иванова, anna@example.com')).toBeVisible();

  await page.goto('/owner/bookings');

  await expect(page.getByRole('heading', { name: 'Предстоящие встречи' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Intro call' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Анна Иванова' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'anna@example.com' })).toBeVisible();
  await expect(page.getByText('Запланирована')).toBeVisible();
});
