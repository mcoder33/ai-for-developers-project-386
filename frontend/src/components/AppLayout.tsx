import { Button, Group } from '@mantine/core';
import { IconCalendarEvent, IconClockHour4, IconListDetails } from '@tabler/icons-react';
import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Бронирование', icon: IconCalendarEvent },
  { to: '/owner/event-types', label: 'Типы событий', icon: IconListDetails },
  { to: '/owner/bookings', label: 'Встречи', icon: IconClockHour4 },
];

export function AppLayout() {
  return (
    <div className="page-shell">
      <header className="top-nav">
        <div className="top-nav-inner">
          <NavLink to="/" className="brand">
            Call Booking
          </NavLink>
          <nav className="nav-links" aria-label="Main navigation">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink key={item.to} to={item.to}>
                  {({ isActive }) => (
                    <Button
                      variant={isActive ? 'filled' : 'subtle'}
                      color={isActive ? 'dark' : 'gray'}
                      leftSection={<Icon size={17} />}
                      radius="md"
                    >
                      {item.label}
                    </Button>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
