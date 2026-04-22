import { useEffect, useRef, useState } from 'react';
import { cursosApi } from '@services/cursos.api';
import type { Curso } from '@app-types/models';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useToast } from '../../hooks/useToast';

type ModalMode = 'createCurso' | 'editCurso' | null;

interface FieldErrors {
  titulo?: string;
  descripcion?: string;
  imagen?: string;
  precio?: string;
  duracion?: string;
  modalidad?: string;
  orden?: string;
  activo?: string;
}

const MAX_TITULO = 150;
const MAX_DESCRIPCION = 5000;
const MAX_DURACION = 100;
const MAX_MODALIDAD = 100;

interface CursoForm {
  titulo: string;
  descripcion: string;
  imagen: string;
  precio: string; // kept as string for input control; coerced on save
  duracion: string;
  modalidad: string;
  activo: boolean;
  orden: number;
}

const EMPTY_FORM: CursoForm = {
  titulo: '',
  descripcion: '',
  imagen: '',
  precio: '',
  duracion: '',
  modalidad: '',
  activo: true,
  orden: 1,
};

const formatPrecio = (precio: number): string =>
  new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(precio);

export default function AdminCursos() {
  const { success, error: toastError } = useToast();
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modal, setModal] = useState<ModalMode>(null);
  const [selected, setSelected] = useState<Curso | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [imgError, setImgError] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState<CursoForm>(EMPTY_FORM);

  const fetchCursos = (): void => {
    setLoading(true);
    cursosApi
      .listAll()
      .then((data) => setCursos(data))
      .catch(() => toastError('Error al cargar cursos'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCursos();
  }, []);

  const resetForm = (): void => {
    setForm(EMPTY_FORM);
    setFieldErrors({});
  };

  const openCreate = (): void => {
    resetForm();
    setSelected(null);
    setModal('createCurso');
  };

  const openEdit = (c: Curso): void => {
    setForm({
      titulo: c.titulo,
      descripcion: c.descripcion,
      imagen: c.imagen ?? '',
      precio: c.precio != null ? String(c.precio) : '',
      duracion: c.duracion ?? '',
      modalidad: c.modalidad ?? '',
      activo: c.activo,
      orden: c.orden ?? 1,
    });
    setFieldErrors({});
    setSelected(c);
    setModal('editCurso');
  };

  const parseFieldErrors = (err: unknown): FieldErrors => {
    const out: FieldErrors = {};
    const response = (err as { response?: { data?: { issues?: Record<string, string[]> } } })?.response;
    const issues = response?.data?.issues;
    // errorHandler returns issues as { field: string[] } (flatten().fieldErrors shape)
    if (issues && typeof issues === 'object' && !Array.isArray(issues)) {
      const known = new Set(['titulo', 'descripcion', 'imagen', 'precio', 'duracion', 'modalidad', 'orden', 'activo']);
      for (const [key, messages] of Object.entries(issues)) {
        if (known.has(key) && Array.isArray(messages) && messages.length > 0) {
          (out as Record<string, string>)[key] = messages[0];
        }
      }
    }
    return out;
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await cursosApi.uploadImage(file);
      setForm((prev) => ({ ...prev, imagen: url }));
      setFieldErrors((prev) => ({ ...prev, imagen: undefined }));
      success('Imagen subida correctamente');
    } catch {
      toastError('Error al subir la imagen');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const saveCurso = async (): Promise<void> => {
    if (!form.titulo.trim()) return;
    setSaving(true);
    setFieldErrors({});

    const precioTrimmed = form.precio.trim();
    let precioValue: number | null = null;
    if (precioTrimmed.length > 0) {
      const parsed = Number(precioTrimmed.replace(',', '.'));
      if (!Number.isFinite(parsed) || parsed < 0) {
        setFieldErrors({ precio: 'Introduce un precio válido (número ≥ 0)' });
        setSaving(false);
        return;
      }
      precioValue = parsed;
    }

    const payload = {
      titulo: form.titulo,
      descripcion: form.descripcion,
      imagen: form.imagen.trim() || null,
      precio: precioValue,
      duracion: form.duracion.trim() || null,
      modalidad: form.modalidad.trim() || null,
      activo: form.activo,
      orden: form.orden,
    };

    try {
      if (modal === 'createCurso') {
        await cursosApi.create(payload);
        success('Curso creado correctamente');
      } else if (selected) {
        await cursosApi.update(selected.id, payload);
        success('Curso actualizado');
      }
      setModal(null);
      fetchCursos();
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 400) {
        const fErrs = parseFieldErrors(err);
        if (Object.keys(fErrs).length > 0) {
          setFieldErrors(fErrs);
          toastError('Revisa los campos marcados');
        } else {
          toastError('Error al guardar el curso');
        }
      } else {
        toastError('Error al guardar el curso');
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteCurso = async (id: string): Promise<void> => {
    if (!window.confirm('¿Eliminar este curso? Esta acción no se puede deshacer.')) return;
    try {
      await cursosApi.remove(id);
      success('Curso eliminado');
      fetchCursos();
    } catch {
      toastError('No se puede eliminar el curso.');
    }
  };

  const isValidImageUrl = (url: string): boolean => {
    const trimmed = url.trim();
    return trimmed.length > 0 && /^https?:\/\//i.test(trimmed);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-charcoal-800">Cursos</h1>
          <p className="text-charcoal-500 mt-1 font-sans text-sm">
            {cursos.length} cursos publicados
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm">
          + Nuevo curso
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : cursos.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-sm border border-ivory-200">
          <p className="text-charcoal-400 font-sans mb-4">No hay cursos creados aún.</p>
          <button onClick={openCreate} className="btn-primary text-sm">
            Crear primer curso
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {cursos.map((c) => (
            <div key={c.id} className="bg-white rounded-sm border border-ivory-200 p-6">
              <div className="flex items-start justify-between gap-4">
                {c.imagen && !imgError[c.id] ? (
                  <div className="w-24 aspect-[4/3] flex-shrink-0 overflow-hidden rounded-sm bg-ivory-100">
                    <img
                      src={c.imagen.startsWith('http') ? c.imagen : `http://localhost:4000${c.imagen}`}
                      className="w-full h-full object-cover rounded-sm"
                      alt={c.titulo}
                      onError={() => setImgError((prev) => ({ ...prev, [c.id]: true }))}
                    />
                  </div>
                ) : c.imagen ? (
                  <div className="w-24 aspect-[4/3] flex-shrink-0 rounded-sm bg-ivory-100 flex items-center justify-center text-charcoal-300 text-xs font-sans">
                    <span aria-label="Imagen no disponible" title="Imagen no disponible">
                      🖼️✕
                    </span>
                  </div>
                ) : null}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h3 className="font-serif text-xl text-charcoal-800">{c.titulo}</h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-sans ${
                        c.activo ? 'bg-sage-100 text-sage-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {c.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <p className="text-charcoal-500 text-sm leading-relaxed">{c.descripcion}</p>

                  {(c.precio != null || c.duracion || c.modalidad) && (
                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-sans">
                      {c.precio != null && (
                        <span className="px-3 py-1 rounded-full bg-sage-50 text-sage-700">
                          {formatPrecio(c.precio)}
                        </span>
                      )}
                      {c.duracion && (
                        <span className="px-3 py-1 rounded-full bg-ivory-100 text-charcoal-600">
                          {c.duracion}
                        </span>
                      )}
                      {c.modalidad && (
                        <span className="px-3 py-1 rounded-full bg-ivory-100 text-charcoal-600">
                          {c.modalidad}
                        </span>
                      )}
                    </div>
                  )}

                  <p className="text-xs text-charcoal-400 mt-2 font-sans">Orden: {c.orden}</p>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => openEdit(c)}
                    className="text-xs px-3 py-1.5 rounded border border-ivory-200 text-charcoal-600 hover:border-sage-300 transition-colors font-sans"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => deleteCurso(c.id)}
                    className="text-xs px-3 py-1.5 rounded border border-red-100 text-red-500 hover:bg-red-50 transition-colors font-sans"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal crear/editar curso */}
      <Modal
        isOpen={modal === 'createCurso' || modal === 'editCurso'}
        onClose={() => setModal(null)}
        title={modal === 'createCurso' ? 'Nuevo curso' : 'Editar curso'}
        dismissOnBackdrop={false}
      >
        <div className="space-y-4">
          <div>
            <label className="form-label">Título *</label>
            <input
              className="input-field"
              value={form.titulo}
              maxLength={MAX_TITULO}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              placeholder="Ej: Iniciación al arte floral"
            />
            <div className="flex justify-between mt-1">
              {fieldErrors.titulo ? (
                <span className="text-xs text-red-500 font-sans">{fieldErrors.titulo}</span>
              ) : (
                <span />
              )}
              <span className="text-xs text-charcoal-400 font-sans">
                {form.titulo.length} / {MAX_TITULO}
              </span>
            </div>
          </div>

          <div>
            <label className="form-label">Descripción</label>
            <textarea
              className="input-field resize-none"
              rows={4}
              value={form.descripcion}
              maxLength={MAX_DESCRIPCION}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              placeholder="Descripción del curso..."
            />
            <div className="flex justify-between mt-1">
              {fieldErrors.descripcion ? (
                <span className="text-xs text-red-500 font-sans">{fieldErrors.descripcion}</span>
              ) : (
                <span />
              )}
              <span className="text-xs text-charcoal-400 font-sans">
                {form.descripcion.length} / {MAX_DESCRIPCION}
              </span>
            </div>
          </div>

          <div>
            <label className="form-label">Imagen (opcional)</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileUpload}
              disabled={uploading}
              className="block w-full text-sm text-charcoal-600 font-sans file:mr-3 file:py-1.5 file:px-3 file:rounded file:border file:border-ivory-200 file:text-xs file:bg-ivory-50 file:text-charcoal-700 hover:file:bg-ivory-100"
            />
            {uploading && (
              <div className="flex items-center gap-2 mt-2 text-xs text-charcoal-500 font-sans">
                <LoadingSpinner size="sm" /> Subiendo imagen...
              </div>
            )}
            <div className="mt-3">
              <label className="form-label text-xs">O introduce una URL</label>
              <input
                className="input-field"
                value={form.imagen}
                onChange={(e) => setForm({ ...form, imagen: e.target.value })}
                placeholder="https://..."
              />
              <p className="text-xs text-charcoal-400 mt-1 font-sans">
                Solo URLs https válidas (máx. 500 caracteres)
              </p>
              {fieldErrors.imagen && (
                <p className="text-xs text-red-500 mt-1 font-sans">{fieldErrors.imagen}</p>
              )}
            </div>
            {isValidImageUrl(form.imagen) && (
              <div className="mt-3">
                <p className="text-xs uppercase tracking-wider text-charcoal-400 font-sans mb-1">
                  Vista previa
                </p>
                <div className="w-32 aspect-[4/3] overflow-hidden rounded-sm bg-ivory-100 border border-ivory-200">
                  <img
                    src={form.imagen.startsWith('http') ? form.imagen : `http://localhost:4000${form.imagen}`}
                    alt="Vista previa"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="form-label">Precio (€)</label>
              <input
                type="number"
                min={0}
                step="1"
                className="input-field"
                value={form.precio}
                onChange={(e) => setForm({ ...form, precio: e.target.value })}
                placeholder="Ej: 120"
              />
              {fieldErrors.precio && (
                <p className="text-xs text-red-500 mt-1 font-sans">{fieldErrors.precio}</p>
              )}
            </div>
            <div>
              <label className="form-label">Duración</label>
              <input
                type="text"
                className="input-field"
                value={form.duracion}
                maxLength={MAX_DURACION}
                onChange={(e) => setForm({ ...form, duracion: e.target.value })}
                placeholder="Ej: 3 horas"
              />
              {fieldErrors.duracion && (
                <p className="text-xs text-red-500 mt-1 font-sans">{fieldErrors.duracion}</p>
              )}
            </div>
            <div>
              <label className="form-label">Modalidad</label>
              <input
                type="text"
                className="input-field"
                value={form.modalidad}
                maxLength={MAX_MODALIDAD}
                onChange={(e) => setForm({ ...form, modalidad: e.target.value })}
                placeholder="Ej: Presencial / Online"
              />
              {fieldErrors.modalidad && (
                <p className="text-xs text-red-500 mt-1 font-sans">{fieldErrors.modalidad}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="curso-activo-toggle"
              type="checkbox"
              checked={form.activo}
              onChange={(e) => setForm({ ...form, activo: e.target.checked })}
              className="h-4 w-4"
            />
            <label
              htmlFor="curso-activo-toggle"
              className="text-sm text-charcoal-700 font-sans cursor-pointer"
            >
              Curso activo (visible al público)
            </label>
          </div>

          <div>
            <label className="form-label">Orden</label>
            <input
              type="number"
              min={1}
              className="input-field"
              value={form.orden}
              onChange={(e) => setForm({ ...form, orden: Number(e.target.value) || 1 })}
            />
            {fieldErrors.orden && (
              <p className="text-xs text-red-500 mt-1 font-sans">{fieldErrors.orden}</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={saveCurso}
              disabled={saving || !form.titulo.trim()}
              className="btn-primary flex-1"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
            <button onClick={() => setModal(null)} className="btn-secondary flex-1">
              Cancelar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
