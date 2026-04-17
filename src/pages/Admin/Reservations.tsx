import { useCallback, useEffect, useState } from 'react';
import { reservationsApi } from '@services/reservations.api';
import type { EstadoReserva, PaginationMeta, Reserva } from '@app-types/models';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useToast } from '../../hooks/useToast';

type FiltroEstado = 'TODAS' | EstadoReserva;

const PAGE_LIMIT = 20;

const EMPTY_PAGINATION: PaginationMeta = {
  page: 1,
  limit: PAGE_LIMIT,
  total: 0,
  totalPages: 0,
};

export default function AdminReservations() {
  const { success, error: toastError } = useToast();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [filtro, setFiltro] = useState<FiltroEstado>('TODAS');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta>(EMPTY_PAGINATION);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Reserva | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchReservas = useCallback(() => {
    setLoading(true);
    setFetchError(null);
    const params: { estado?: EstadoReserva; page: number; limit: number } = {
      page,
      limit: PAGE_LIMIT,
    };
    if (filtro !== 'TODAS') params.estado = filtro;
    reservationsApi.list(params)
      .then((res) => {
        setReservas(res.data);
        setPagination(res.pagination);
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Error desconocido';
        setFetchError(`No pudimos cargar las reservas: ${msg}`);
        toastError('Error al cargar reservas');
      })
      .finally(() => setLoading(false));
  }, [filtro, page, toastError]);

  useEffect(() => { fetchReservas(); }, [fetchReservas]);

  // Reset to page 1 whenever the estado filter changes.
  const selectFiltro = (value: FiltroEstado) => {
    setFiltro(value);
    setPage(1);
  };

  const cambiarEstado = async (id: string, estado: 'ACEPTADA' | 'RECHAZADA') => {
    setActionLoading(id + estado);
    try {
      await reservationsApi.update(id, { estado });
      success(estado === 'ACEPTADA' ? 'Reserva aceptada. Email enviado al cliente.' : 'Reserva rechazada. Email enviado al cliente.');
      setSelected(null);
      fetchReservas();
    } catch {
      toastError('Error al actualizar la reserva');
    } finally {
      setActionLoading(null);
    }
  };

  const filtros: { label: string; value: FiltroEstado }[] = [
    { label: 'Todas', value: 'TODAS' },
    { label: 'Pendientes', value: 'PENDIENTE' },
    { label: 'Aceptadas', value: 'ACEPTADA' },
    { label: 'Rechazadas', value: 'RECHAZADA' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-charcoal-800">Reservas</h1>
          <p className="text-charcoal-500 mt-1 font-sans text-sm">{pagination.total} solicitudes en total</p>
        </div>
        <button onClick={fetchReservas} className="btn-secondary text-sm">
          Actualizar
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {filtros.map((f) => (
          <button
            key={f.value}
            onClick={() => selectFiltro(f.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-sans transition-colors ${
              filtro === f.value
                ? 'bg-sage-600 text-white'
                : 'bg-white text-charcoal-600 border border-ivory-200 hover:border-sage-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {fetchError && (
        <p
          role="alert"
          className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-4 py-3"
        >
          {fetchError}
        </p>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-sm border border-ivory-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
        ) : reservas.length === 0 ? (
          <p className="text-center text-charcoal-400 py-16 font-sans">No hay reservas con este filtro.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-elegant">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Servicio</th>
                  <th>Fecha solicitud</th>
                  <th>Evento</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reservas.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div>
                        <p className="font-medium text-charcoal-700">{r.nombre}</p>
                        <p className="text-xs text-charcoal-400">{r.email}</p>
                        <p className="text-xs text-charcoal-400">{r.telefono}</p>
                      </div>
                    </td>
                    <td className="text-charcoal-600 text-sm">{r.servicioNombre ?? '—'}</td>
                    <td className="text-charcoal-500 text-sm">
                      {new Date(r.createdAt).toLocaleDateString('es-ES')}
                    </td>
                    <td className="text-charcoal-500 text-sm">
                      {r.fechaEvento ? new Date(r.fechaEvento).toLocaleDateString('es-ES') : '—'}
                    </td>
                    <td><Badge estado={r.estado} /></td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelected(r)}
                          className="text-xs px-3 py-1 rounded border border-ivory-200 text-charcoal-600 hover:border-sage-300 transition-colors font-sans"
                        >
                          Ver
                        </button>
                        {r.estado === 'PENDIENTE' && (
                          <>
                            <button
                              onClick={() => cambiarEstado(r.id, 'ACEPTADA')}
                              disabled={actionLoading === r.id + 'ACEPTADA'}
                              className="text-xs px-3 py-1 rounded bg-sage-600 text-white hover:bg-sage-700 transition-colors font-sans disabled:opacity-50"
                            >
                              Aceptar
                            </button>
                            <button
                              onClick={() => cambiarEstado(r.id, 'RECHAZADA')}
                              disabled={actionLoading === r.id + 'RECHAZADA'}
                              className="text-xs px-3 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50 transition-colors font-sans disabled:opacity-50"
                            >
                              Rechazar
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Paginación */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm font-sans">
          <p className="text-charcoal-500">
            Página {pagination.page} de {pagination.totalPages} · {pagination.total} resultados
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={pagination.page <= 1}
              className="px-3 py-1.5 rounded border border-ivory-200 text-charcoal-600 hover:border-sage-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Anterior
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1.5 rounded border border-ivory-200 text-charcoal-600 hover:border-sage-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}

      {/* Modal detalle */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Detalle de reserva" dismissOnBackdrop={false}>
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-charcoal-400 text-xs uppercase tracking-wider mb-1">Nombre</p>
                <p className="text-charcoal-700 font-medium">{selected.nombre}</p>
              </div>
              <div>
                <p className="text-charcoal-400 text-xs uppercase tracking-wider mb-1">Email</p>
                <p className="text-charcoal-700">{selected.email}</p>
              </div>
              <div>
                <p className="text-charcoal-400 text-xs uppercase tracking-wider mb-1">Teléfono</p>
                <p className="text-charcoal-700">{selected.telefono || '—'}</p>
              </div>
              <div>
                <p className="text-charcoal-400 text-xs uppercase tracking-wider mb-1">Servicio</p>
                <p className="text-charcoal-700">{selected.servicioNombre ?? '—'}</p>
              </div>
              <div>
                <p className="text-charcoal-400 text-xs uppercase tracking-wider mb-1">Fecha evento</p>
                <p className="text-charcoal-700">
                  {selected.fechaEvento ? new Date(selected.fechaEvento).toLocaleDateString('es-ES') : '—'}
                </p>
              </div>
              <div>
                <p className="text-charcoal-400 text-xs uppercase tracking-wider mb-1">Estado</p>
                <Badge estado={selected.estado} />
              </div>
            </div>
            {selected.mensaje && (
              <div>
                <p className="text-charcoal-400 text-xs uppercase tracking-wider mb-1">Mensaje</p>
                <p className="text-charcoal-600 text-sm bg-ivory-50 p-3 rounded">{selected.mensaje}</p>
              </div>
            )}
            {selected.estado === 'PENDIENTE' && (
              <div className="flex gap-3 pt-4 border-t border-ivory-100">
                <button
                  onClick={() => cambiarEstado(selected.id, 'ACEPTADA')}
                  disabled={actionLoading === selected.id + 'ACEPTADA'}
                  className="btn-primary flex-1 text-sm"
                >
                  {actionLoading === selected.id + 'ACEPTADA' ? 'Enviando...' : 'Aceptar reserva'}
                </button>
                <button
                  onClick={() => cambiarEstado(selected.id, 'RECHAZADA')}
                  disabled={actionLoading === selected.id + 'RECHAZADA'}
                  className="flex-1 text-sm px-4 py-2 rounded border border-red-200 text-red-600 hover:bg-red-50 transition-colors font-sans"
                >
                  Rechazar
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
