import { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@hooks/useAuth';
import { useNotifications } from '@hooks/useNotifications';

export default function AdminLayout() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const { notifications } = useNotifications(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const onLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const onBellClick = () => {
    navigate('/admin/reservations');
  };

  const badgeCount = notifications.total;

  const navLinks = [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/services', label: 'Servicios' },
    { to: '/admin/cursos', label: 'Cursos' },
    { to: '/admin/reservations', label: 'Reservas' },
    { to: '/admin/presupuestos', label: 'Presupuestos' },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Overlay móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r p-6 flex flex-col
          transform transition-transform duration-200 ease-in-out
          md:static md:translate-x-0 md:z-auto md:flex
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-serif text-xl font-bold text-primary-700">Admin</h2>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1 rounded hover:bg-gray-100 text-charcoal-600"
            aria-label="Cerrar menú"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <nav className="space-y-2 flex-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setSidebarOpen(false)}
              className="block py-2 px-3 rounded hover:bg-primary-50 text-charcoal-700 font-sans text-sm"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button onClick={onLogout} className="mt-8 text-sm text-red-600 hover:underline text-left font-sans">
          Cerrar sesión
        </button>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between gap-4 bg-white border-b px-4 md:px-8 py-3">
          {/* Hamburger — solo en móvil */}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded hover:bg-gray-100 text-charcoal-600"
            aria-label="Abrir menú"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>

          <div className="flex-1" />

          {/* Campana de notificaciones */}
          <button
            type="button"
            onClick={onBellClick}
            aria-label={
              badgeCount > 0
                ? `${badgeCount} notificaciones pendientes`
                : 'Sin notificaciones'
            }
            className="relative inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
          >
            <span className="text-xl" aria-hidden="true">🔔</span>
            {badgeCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-sans font-semibold flex items-center justify-center">
                {badgeCount > 99 ? '99+' : badgeCount}
              </span>
            )}
          </button>
        </header>

        <div className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
