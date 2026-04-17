import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@hooks/useAuth';
import { useNotifications } from '@hooks/useNotifications';

export default function AdminLayout() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const { notifications } = useNotifications(true);

  const onLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const onBellClick = () => {
    // Por ahora dirige siempre a /admin/reservations
    navigate('/admin/reservations');
  };

  const badgeCount = notifications.total;

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-64 bg-white border-r p-6">
        <h2 className="font-serif text-xl font-bold text-primary-700 mb-8">Admin</h2>
        <nav className="space-y-2">
          <Link to="/admin/dashboard" className="block py-2 px-3 rounded hover:bg-primary-50">Dashboard</Link>
          <Link to="/admin/services" className="block py-2 px-3 rounded hover:bg-primary-50">Servicios</Link>
          <Link to="/admin/reservations" className="block py-2 px-3 rounded hover:bg-primary-50">Reservas</Link>
          <Link to="/admin/presupuestos" className="block py-2 px-3 rounded hover:bg-primary-50">Presupuestos</Link>
        </nav>
        <button onClick={onLogout} className="mt-8 text-sm text-red-600 hover:underline">
          Cerrar sesión
        </button>
      </aside>
      <main className="flex-1 flex flex-col">
        <header className="flex items-center justify-end gap-4 bg-white border-b px-8 py-3">
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
        <div className="flex-1 p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
