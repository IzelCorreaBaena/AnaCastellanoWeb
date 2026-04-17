import { useEffect, useMemo, useState } from 'react';
import {
  presupuestosApi,
  type CreatePresupuestoInput,
  type PresupuestoItemInput,
} from '@services/presupuestos.api';
import type { PresupuestoListItem } from '@app-types/models';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useToast } from '../../hooks/useToast';

interface FormState {
  clienteNombre: string;
  clienteEmail: string;
  clienteTelefono: string;
  items: PresupuestoItemInput[];
  igicPorcentaje: number;
  notas: string;
}

interface FormErrors {
  clienteNombre?: string;
  clienteEmail?: string;
  items?: string;
  igicPorcentaje?: string;
}

const DEFAULT_IGIC = 7;

const EMPTY_ITEM: PresupuestoItemInput = {
  descripcion: '',
  cantidad: 1,
  precioUnitario: 0,
};

const INITIAL_FORM: FormState = {
  clienteNombre: '',
  clienteEmail: '',
  clienteTelefono: '',
  items: [{ ...EMPTY_ITEM }],
  igicPorcentaje: DEFAULT_IGIC,
  notas: '',
};

const EUR = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
});

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.clienteNombre.trim()) {
    errors.clienteNombre = 'El nombre del cliente es obligatorio.';
  }
  if (
    form.clienteEmail.trim() &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.clienteEmail.trim())
  ) {
    errors.clienteEmail = 'Introduce un email válido.';
  }
  if (form.items.length === 0) {
    errors.items = 'Añade al menos una línea.';
  } else {
    const hasInvalid = form.items.some(
      (it) =>
        !it.descripcion.trim() ||
        !Number.isFinite(it.cantidad) ||
        it.cantidad < 1 ||
        !Number.isFinite(it.precioUnitario) ||
        it.precioUnitario < 0,
    );
    if (hasInvalid) {
      errors.items = 'Revisa las líneas: descripción, cantidad (≥1) y precio (≥0).';
    }
  }
  if (
    !Number.isFinite(form.igicPorcentaje) ||
    form.igicPorcentaje < 0 ||
    form.igicPorcentaje > 100
  ) {
    errors.igicPorcentaje = 'El IGIC debe estar entre 0 y 100.';
  }
  return errors;
}

export default function AdminPresupuestos() {
  const { success, error: toastError } = useToast();
  const [items, setItems] = useState<PresupuestoListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchList = async (): Promise<void> => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await presupuestosApi.list();
      setItems(data);
    } catch {
      setLoadError('Error al cargar los presupuestos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchList();
  }, []);

  const totals = useMemo(() => {
    const subtotal = form.items.reduce((acc, it) => {
      const qty = Number.isFinite(it.cantidad) ? it.cantidad : 0;
      const price = Number.isFinite(it.precioUnitario) ? it.precioUnitario : 0;
      return acc + qty * price;
    }, 0);
    const igicPct =
      Number.isFinite(form.igicPorcentaje) && form.igicPorcentaje >= 0
        ? form.igicPorcentaje
        : 0;
    const igicImporte = subtotal * (igicPct / 100);
    const total = subtotal + igicImporte;
    return { subtotal, igicImporte, total };
  }, [form.items, form.igicPorcentaje]);

  const openCreate = (): void => {
    setForm(INITIAL_FORM);
    setErrors({});
    setSubmitError(null);
    setModalOpen(true);
  };

  const closeModal = (): void => {
    if (saving) return;
    setModalOpen(false);
  };

  const updateItem = <K extends keyof PresupuestoItemInput>(
    index: number,
    key: K,
    value: PresupuestoItemInput[K],
  ): void => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((it, i) => (i === index ? { ...it, [key]: value } : it)),
    }));
  };

  const addItem = (): void => {
    setForm((prev) => ({ ...prev, items: [...prev.items, { ...EMPTY_ITEM }] }));
  };

  const removeItem = (index: number): void => {
    setForm((prev) => {
      if (prev.items.length <= 1) return prev;
      return { ...prev, items: prev.items.filter((_, i) => i !== index) };
    });
  };

  const handleSubmit = async (): Promise<void> => {
    const v = validate(form);
    setErrors(v);
    setSubmitError(null);
    if (Object.keys(v).length > 0) return;

    const payload: CreatePresupuestoInput = {
      clienteNombre: form.clienteNombre.trim(),
      items: form.items.map((it) => ({
        descripcion: it.descripcion.trim(),
        cantidad: it.cantidad,
        precioUnitario: it.precioUnitario,
      })),
      igicPorcentaje: form.igicPorcentaje,
    };
    if (form.clienteEmail.trim()) payload.clienteEmail = form.clienteEmail.trim();
    if (form.clienteTelefono.trim()) payload.clienteTelefono = form.clienteTelefono.trim();
    if (form.notas.trim()) payload.notas = form.notas.trim();

    setSaving(true);
    try {
      const created = await presupuestosApi.create(payload);
      success('Presupuesto creado correctamente');
      try {
        await presupuestosApi.downloadPdf(created.id, created.numero);
      } catch {
        toastError('Presupuesto creado pero el PDF no se pudo descargar.');
      }
      setModalOpen(false);
      void fetchList();
    } catch {
      setSubmitError('No se pudo crear el presupuesto. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async (id: string, numero: number): Promise<void> => {
    setDownloadingId(id);
    try {
      await presupuestosApi.downloadPdf(id, numero);
    } catch {
      toastError('Error al descargar el PDF');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-charcoal-800">Presupuestos</h1>
          <p className="text-charcoal-500 mt-1 font-sans text-sm">
            {items.length} presupuestos generados
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm">
          + Nuevo presupuesto
        </button>
      </div>

      {loadError && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-sans rounded-sm px-4 py-3">
          {loadError}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-sm border border-ivory-200">
          <p className="text-charcoal-400 font-sans mb-4">
            No hay presupuestos creados aún.
          </p>
          <button onClick={openCreate} className="btn-primary text-sm">
            Crear primer presupuesto
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-sm border border-ivory-200 overflow-hidden">
          <table className="w-full text-sm font-sans">
            <thead className="bg-ivory-50 text-charcoal-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3">Nº</th>
                <th className="text-left px-4 py-3">Cliente</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-right px-4 py-3">Total</th>
                <th className="text-left px-4 py-3">Fecha</th>
                <th className="text-right px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory-100">
              {items.map((p) => (
                <tr key={p.id} className="hover:bg-ivory-50 transition-colors">
                  <td className="px-4 py-3 text-charcoal-700 font-medium">#{p.numero}</td>
                  <td className="px-4 py-3 text-charcoal-700">{p.clienteNombre}</td>
                  <td className="px-4 py-3 text-charcoal-500">
                    {p.clienteEmail ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-charcoal-700">
                    {EUR.format(p.total)}
                  </td>
                  <td className="px-4 py-3 text-charcoal-500">
                    {formatDate(p.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => void handleDownload(p.id, p.numero)}
                      disabled={downloadingId === p.id}
                      className="text-xs px-3 py-1.5 rounded border border-ivory-200 text-charcoal-600 hover:border-sage-300 transition-colors font-sans disabled:opacity-50"
                    >
                      {downloadingId === p.id ? 'Descargando…' : 'Descargar PDF'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title="Nuevo presupuesto"
        size="lg"
        dismissOnBackdrop={false}
      >
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="form-label">Nombre del cliente *</label>
              <input
                className={`input-field ${errors.clienteNombre ? 'input-error' : ''}`}
                value={form.clienteNombre}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, clienteNombre: e.target.value }))
                }
                placeholder="Ej: María Pérez"
              />
              {errors.clienteNombre && (
                <p className="text-xs text-red-500 mt-1 font-sans">
                  {errors.clienteNombre}
                </p>
              )}
            </div>
            <div>
              <label className="form-label">Email</label>
              <input
                type="email"
                className={`input-field ${errors.clienteEmail ? 'input-error' : ''}`}
                value={form.clienteEmail}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, clienteEmail: e.target.value }))
                }
                placeholder="cliente@ejemplo.com"
              />
              {errors.clienteEmail && (
                <p className="text-xs text-red-500 mt-1 font-sans">
                  {errors.clienteEmail}
                </p>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="form-label">Teléfono</label>
              <input
                className="input-field"
                value={form.clienteTelefono}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, clienteTelefono: e.target.value }))
                }
                placeholder="Opcional"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs uppercase tracking-wider text-charcoal-400 font-sans">
                Líneas
              </p>
              <button
                type="button"
                onClick={addItem}
                className="text-xs px-3 py-1.5 rounded border border-ivory-200 text-charcoal-600 hover:border-sage-300 transition-colors font-sans"
              >
                + Añadir línea
              </button>
            </div>
            <div className="space-y-2">
              {form.items.map((item, idx) => {
                const lineTotal = (Number.isFinite(item.cantidad) ? item.cantidad : 0) *
                  (Number.isFinite(item.precioUnitario) ? item.precioUnitario : 0);
                return (
                  <div
                    key={idx}
                    className="grid gap-2 sm:grid-cols-[1fr_90px_120px_90px_auto] items-start p-3 bg-ivory-50 rounded-sm"
                  >
                    <input
                      className="input-field"
                      placeholder="Descripción"
                      value={item.descripcion}
                      onChange={(e) => updateItem(idx, 'descripcion', e.target.value)}
                    />
                    <input
                      type="number"
                      min={1}
                      step={1}
                      className="input-field"
                      value={item.cantidad}
                      onChange={(e) =>
                        updateItem(idx, 'cantidad', Number(e.target.value) || 0)
                      }
                      placeholder="Cant."
                    />
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      className="input-field"
                      value={item.precioUnitario}
                      onChange={(e) =>
                        updateItem(idx, 'precioUnitario', Number(e.target.value) || 0)
                      }
                      placeholder="€ unidad"
                    />
                    <div className="text-sm text-charcoal-600 font-sans text-right self-center">
                      {EUR.format(lineTotal)}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      disabled={form.items.length <= 1}
                      aria-label="Eliminar línea"
                      className="self-center text-charcoal-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed px-2"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
            {errors.items && (
              <p className="text-xs text-red-500 mt-2 font-sans">{errors.items}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="form-label">IGIC %</label>
              <input
                type="number"
                min={0}
                max={100}
                step="0.01"
                className={`input-field ${errors.igicPorcentaje ? 'input-error' : ''}`}
                value={form.igicPorcentaje}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    igicPorcentaje: Number(e.target.value),
                  }))
                }
              />
              {errors.igicPorcentaje && (
                <p className="text-xs text-red-500 mt-1 font-sans">
                  {errors.igicPorcentaje}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="form-label">Notas</label>
            <textarea
              className="input-field resize-none"
              rows={3}
              value={form.notas}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, notas: e.target.value }))
              }
              placeholder="Opcional"
            />
          </div>

          <div className="bg-ivory-50 rounded-sm p-4 space-y-1 text-sm font-sans">
            <div className="flex justify-between text-charcoal-600">
              <span>Subtotal</span>
              <span>{EUR.format(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between text-charcoal-600">
              <span>IGIC ({form.igicPorcentaje || 0}%)</span>
              <span>{EUR.format(totals.igicImporte)}</span>
            </div>
            <div className="flex justify-between text-charcoal-800 font-semibold pt-1 border-t border-ivory-200 mt-1">
              <span>Total</span>
              <span>{EUR.format(totals.total)}</span>
            </div>
          </div>

          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-sans rounded-sm px-4 py-3">
              {submitError}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => void handleSubmit()}
              disabled={saving}
              className="btn-primary flex-1"
            >
              {saving ? 'Generando…' : 'Generar presupuesto'}
            </button>
            <button
              onClick={closeModal}
              disabled={saving}
              className="btn-secondary flex-1"
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
