import { useEffect, useState } from 'react';
import { cursosApi } from '@services/cursos.api';
import type { Curso } from '@app-types/models';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useToast } from '../../hooks/useToast';
import ImageUploader from '../../components/ui/ImageUploader';

const API_ORIGIN = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/api$/, '')
  : 'http://localhost:4000';
const resolveMedia = (src: string) =>
  src.startsWith('http') ? src : `${API_ORIGIN}${src}`;

const isVideoUrl = (url: string): boolean =>
  /\/video\/upload\//.test(url) ||
  /\.(mp4|webm|mov|avi|mkv)(\?|$)/i.test(url);

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
  imagenes: string[];
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
  imagenes: [],
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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [imgError, setImgError] = useState<Record<string, boolean>>({});

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
      imagenes: c.imagenes?.filter(Boolean) ?? (c.imagen ? [c.imagen] : []),
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
      imagen: form.imagenes[0] ?? (form.imagen.trim() || null),
      imagenes: form.imagenes.length > 0 ? form.imagenes : undefined,
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
            <div key={c.id} className="bg-white rounded-sm border border-ivory-200 p-4 sm:p-6">
              <div className="flex items-start gap-4">
                {/* Thumbnail — imagen o vídeo */}
                {c.imagen && !imgError[c.id] ? (
                  <div className="w-20 sm:w-24 aspect-[4/3] flex-shrink-0 overflow-hidden rounded-sm bg-ivory-100">
                    {isVideoUrl(c.imagen) ? (
                      <video
                        src={resolveMedia(c.imagen)}
                        className="w-full h-full object-cover"
                        muted
                        preload="metadata"
                        onError={() => setImgError((prev) => ({ ...prev, [c.id]: true }))}
                      />
                    ) : (
                      <img
                        src={resolveMedia(c.imagen)}
                        className="w-full h-full object-cover"
                        alt={c.titulo}
                        onError={() => setImgError((prev) => ({ ...prev, [c.id]: true }))}
                      />
                    )}
                  </div>
                ) : c.imagen ? (
                  <div className="w-20 sm:w-24 aspect-[4/3] flex-shrink-0 rounded-sm bg-ivory-100 flex items-center justify-center text-charcoal-300 text-xs font-sans">
                    <span aria-label="Imagen no disponible">—</span>
                  </div>
                ) : null}

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-serif text-xl text-charcoal-800">{c.titulo}</h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-sans ${
                        c.activo ? 'bg-sage-100 text-sage-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {c.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <p className="text-charcoal-500 text-sm leading-relaxed line-clamp-2">{c.descripcion}</p>

                  {(c.precio != null || c.duracion || c.modalidad) && (
                    <div className="mt-2 flex flex-wrap gap-2 text-xs font-sans">
                      {c.precio != null && (
                        <span className="px-2 py-0.5 rounded-full bg-sage-50 text-sage-700">
                          {formatPrecio(c.precio)}
                        </span>
                      )}
                      {c.duracion && (
                        <span className="px-2 py-0.5 rounded-full bg-ivory-100 text-charcoal-600">
                          {c.duracion}
                        </span>
                      )}
                      {c.modalidad && (
                        <span className="px-2 py-0.5 rounded-full bg-ivory-100 text-charcoal-600">
                          {c.modalidad}
                        </span>
                      )}
                    </div>
                  )}

                  {(c.imagenes?.length ?? 0) > 0 && (
                    <p className="text-xs text-charcoal-400 mt-1 font-sans">
                      {c.imagenes!.length} archivo{c.imagenes!.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>

              {/* Action buttons — separate row for mobile */}
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-ivory-100">
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
            <label className="form-label">Imágenes</label>
            <ImageUploader
              images={form.imagenes}
              onChange={(newImages) => setForm({ ...form, imagenes: newImages })}
              uploadFn={cursosApi.uploadImage}
            />
            <p className="text-xs text-charcoal-400 mt-1 font-sans">
              La primera imagen será la imagen principal del curso.
            </p>
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
