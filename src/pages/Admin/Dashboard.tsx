import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { reservationsApi } from '@services/reservations.api';
import type { Reserva } from '@app-types/models';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface Stats {
  total: number;
  pendientes: number;
  aceptadas: number;
  rechazadas: number;
}

export default function AdminDashboard() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pendientes: 0, aceptadas: 0, rechazadas: 0 });
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    // Stats must reflect TOTALS across all pages, not only the current page,
    // so we fetch the recent list (for preview) plus per-estado counts in
    // parallel and read `pagination.total` from each envelope.
    Promise.all([
      reservationsApi.list({ page: 1, limit: 5 }),
      reservationsApi.list({ estado: 'PENDIENTE', page: 1, limit: 1 }),
      reservationsApi.list({ estado: 'ACEPTADA', page: 1, limit: 1 }),
      reservationsApi.list({ estado: 'RECHAZADA', page: 1, limit: 1 }),
    ])
      .then(([recent, pend, acep, rech]) => {
        setReservas(recent.data);
        setStats({
          total: recent.pagination.total,
          pendientes: pend.pagination.total,
          aceptadas: acep.pagination.total,
          rechazadas: rech.pagination.total,
        });
        setFetchError(null);
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Error desconocido';
        setFetchError(`No pudimos cargar las reservas: ${msg}`);
      })
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Total reservas', value: stats.total, color: 'border-sage-400' },
    { label: 'Pendientes', value: stats.pendientes, color: 'border-amber-400' },
    { label: 'Aceptadas', value: stats.aceptadas, color: 'border-green-400' },
    { label: 'Rechazadas', value: stats.rechazadas, color: 'border-red-300' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl text-charcoal-800">Resumen</h1>
        <p className="text-charcoal-500 mt-1 font-sans text-sm">Bienvenida al panel de administración de Ana Castellano Florista.</p>
      </div>

      {fetchError && (
        <p
          role="alert"
          className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-4 py-3"
        >
          {fetchError}
        </p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className={`admin-stat-card border-l-4 ${s.color}`}>
            <p className="text-3xl font-serif text-charcoal-800">{loading ? '—' : s.value}</p>
            <p className="text-sm text-charcoal-500 font-sans mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Accesos rápidos */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link to="/admin/reservations" className="block p-6 bg-white rounded-sm border border-ivory-200 hover:border-sage-300 hover:shadow-sm transition-all group">
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-5 h-5 text-sage-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
            </svg>
            <h3 className="font-sans font-medium text-charcoal-700 group-hover:text-sage-600 transition-colors">Gestionar reservas</h3>
          </div>
          <p className="text-sm text-charcoal-400">Ver, aceptar y rechazar solicitudes de clientes.</p>
        </Link>

        <Link to="/admin/services" className="block p-6 bg-white rounded-sm border border-ivory-200 hover:border-sage-300 hover:shadow-sm transition-all group">
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-5 h-5 text-sage-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            <h3 className="font-sans font-medium text-charcoal-700 group-hover:text-sage-600 transition-colors">Gestionar servicios</h3>
          </div>
          <p className="text-sm text-charcoal-400">Crear, editar y eliminar servicios y bloques.</p>
        </Link>
      </div>

      {/* Últimas reservas */}
      <div className="bg-white rounded-sm border border-ivory-200">
        <div className="p-6 border-b border-ivory-100 flex items-center justify-between">
          <h2 className="font-sans font-medium text-charcoal-700">Últimas reservas</h2>
          <Link to="/admin/reservations" className="text-sm text-sage-600 hover:text-sage-700 font-sans">Ver todas →</Link>
        </div>
        {loading ? (
          <div className="flex justify-center py-10"><LoadingSpinner /></div>
        ) : reservas.length === 0 ? (
          <p className="text-center text-charcoal-400 py-10 font-sans text-sm">No hay reservas aún.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-elegant">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Servicio</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {reservas.slice(0, 5).map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div>
                        <p className="font-medium text-charcoal-700">{r.nombre}</p>
                        <p className="text-xs text-charcoal-400">{r.email}</p>
                      </div>
                    </td>
                    <td className="text-charcoal-600">{r.servicioNombre ?? '—'}</td>
                    <td className="text-charcoal-500 text-sm">
                      {new Date(r.createdAt).toLocaleDateString('es-ES')}
                    </td>
                    <td><Badge estado={r.estado} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
