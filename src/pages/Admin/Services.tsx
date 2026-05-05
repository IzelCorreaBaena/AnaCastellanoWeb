import { useEffect, useState } from 'react';
import { servicesApi } from '@services/services.api';
import { blocksApi } from '@services/blocks.api';
import type { Servicio } from '@app-types/models';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useToast } from '../../hooks/useToast';
import ImageUploader from '../../components/ui/ImageUploader';
import { resolveImg as resolveMedia, isVideoUrl } from '../../utils/image';

type ModalMode = 'createService' | 'editService' | 'manageBlocks' | 'setMainImage' | null;

interface FieldErrors {
  titulo?: string;
  descripcion?: string;
  imagen?: string;
  orden?: string;
  activo?: string;
}

const MAX_TITULO = 150;
const MAX_DESCRIPCION = 5000;

export default function AdminServices() {
  const { success, error: toastError } = useToast();
  const [services, setServices] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalMode>(null);
  const [selected, setSelected] = useState<Servicio | null>(null);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [blockSaving, setBlockSaving] = useState<Record<string, boolean>>({});

  const [formS, setFormS] = useState({
    titulo: '',
    descripcion: '',
    imagenes: [] as string[],
    activo: true,
    orden: 1,
  });
  const [formB, setFormB] = useState({ titulo: '', descripcion: '', orden: 1 });

  const fetchServices = () => {
    setLoading(true);
    servicesApi.listAll()
      .then((data) => setServices(data))
      .catch(() => toastError('Error al cargar servicios'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchServices(); }, []);

  const resetForm = () => {
    setFormS({ titulo: '', descripcion: '', imagenes: [], activo: true, orden: 1 });
    setFieldErrors({});
  };

  const openCreate = () => {
    resetForm();
    setSelected(null);
    setModal('createService');
  };

  const openEdit = (s: Servicio) => {
    setFormS({
      titulo: s.titulo,
      descripcion: s.descripcion,
      imagenes: s.imagenes ?? [],
      activo: s.activo,
      orden: s.orden ?? 1,
    });
    setFieldErrors({});
    setSelected(s);
    setModal('editService');
  };

  const openBlocks = (s: Servicio) => {
    setSelected(s);
    setFormB({ titulo: '', descripcion: '', orden: (s.bloques.length + 1) });
    setModal('manageBlocks');
  };

  const parseFieldErrors = (err: unknown): FieldErrors => {
    const out: FieldErrors = {};
    const response = (err as { response?: { data?: { issues?: Record<string, string[]> } } })?.response;
    const issues = response?.data?.issues;
    const known = new Set(['titulo', 'descripcion', 'imagen', 'orden', 'activo']);
    if (issues && typeof issues === 'object' && !Array.isArray(issues)) {
      for (const [key, messages] of Object.entries(issues)) {
        if (known.has(key) && Array.isArray(messages) && messages.length > 0) {
          (out as Record<string, string>)[key] = messages[0];
        }
      }
    }
    return out;
  };

  const saveService = async () => {
    if (!formS.titulo.trim()) return;
    setSaving(true);
    setFieldErrors({});
    const payload = {
      titulo: formS.titulo,
      descripcion: formS.descripcion,
      imagen: formS.imagenes[0] ?? null,
      imagenes: formS.imagenes.length > 0 ? formS.imagenes : undefined,
      activo: formS.activo,
      orden: formS.orden,
    };
    try {
      if (modal === 'createService') {
        await servicesApi.create(payload);
        success('Servicio creado correctamente');
      } else if (selected) {
        await servicesApi.update(selected.id, payload);
        success('Servicio actualizado');
      }
      setModal(null);
      fetchServices();
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 400) {
        const fErrs = parseFieldErrors(err);
        if (Object.keys(fErrs).length > 0) {
          setFieldErrors(fErrs);
          toastError('Revisa los campos marcados');
        } else {
          toastError('Error al guardar el servicio');
        }
      } else {
        toastError('Error al guardar el servicio');
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteService = async (id: string) => {
    if (!window.confirm('¿Eliminar este servicio? Esta acción no se puede deshacer.')) return;
    try {
      await servicesApi.remove(id);
      success('Servicio eliminado');
      fetchServices();
    } catch {
      toastError('No se puede eliminar. Puede tener reservas activas.');
    }
  };

  const toggleActivo = async (id: string, current: boolean) => {
    try {
      await servicesApi.update(id, { activo: !current });
      success(current ? 'Servicio ocultado' : 'Servicio publicado');
      fetchServices();
    } catch {
      toastError('Error al cambiar la visibilidad');
    }
  };

  const setMainImage = async (id: string, imageIndex: number) => {
    try {
      const service = services.find(s => s.id === id);
      if (!service || !service.imagenes || service.imagenes.length <= imageIndex) return;
      
      // Mover la imagen seleccionada al principio del array
      const newImages = [...service.imagenes];
      const [selectedImage] = newImages.splice(imageIndex, 1);
      newImages.unshift(selectedImage);
      
      await servicesApi.update(id, { 
        imagen: newImages[0] ?? null,
        imagenes: newImages 
      });
      success('Imagen principal actualizada');
      fetchServices();
    } catch {
      toastError('Error al cambiar imagen principal');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-charcoal-800">Servicios</h1>
          <p className="text-charcoal-500 mt-1 font-sans text-sm">
            {services.filter((s) => s.activo).length} visibles · {services.filter((s) => !s.activo).length} ocultos
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm">
          + Nuevo servicio
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : services.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-sm border border-ivory-200">
          <p className="text-charcoal-400 font-sans mb-4">No hay servicios creados aún.</p>
          <button onClick={openCreate} className="btn-primary text-sm">Crear primer servicio</button>
        </div>
      ) : (
        <div className="space-y-4">
          {services.map((s) => (
            <div key={s.id} className="bg-white rounded-sm border border-ivory-200 p-4 sm:p-6">
              <div className="flex items-start gap-4">
                {/* Thumbnail — galería de imágenes */}
                {(s.imagenes && s.imagenes.length > 0) ? (
                  <div className="w-20 sm:w-24 aspect-[4/3] flex-shrink-0 overflow-hidden rounded-sm bg-ivory-100 relative group cursor-pointer"
                       onClick={() => setSelected(s)}
                       title="Ver todas las imágenes">
                    {isVideoUrl(s.imagenes[0]) ? (
                      <video
                        src={resolveMedia(s.imagenes[0])}
                        className="w-full h-full object-cover"
                        muted
                        preload="metadata"
                        onError={() => setImgError((prev) => ({ ...prev, [s.id]: true }))}
                      />
                    ) : (
                      <img
                        src={resolveMedia(s.imagenes[0])}
                        className="w-full h-full object-cover"
                        alt={s.titulo}
                        onError={() => setImgError((prev) => ({ ...prev, [s.id]: true }))}
                      />
                    )}
                    {s.imagenes.length > 1 && (
                      <div className="absolute top-1 right-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                        +{s.imagenes.length - 1}
                      </div>
                    )}
                  </div>
                ) : s.imagen ? (
                  <div className="w-20 sm:w-24 aspect-[4/3] flex-shrink-0 overflow-hidden rounded-sm bg-ivory-100">
                    {isVideoUrl(s.imagen) ? (
                      <video
                        src={resolveMedia(s.imagen)}
                        className="w-full h-full object-cover"
                        muted
                        preload="metadata"
                        onError={() => setImgError((prev) => ({ ...prev, [s.id]: true }))}
                      />
                    ) : (
                      <img
                        src={resolveMedia(s.imagen)}
                        className="w-full h-full object-cover"
                        alt={s.titulo}
                        onError={() => setImgError((prev) => ({ ...prev, [s.id]: true }))}
                      />
                    )}
                  </div>
                ) : (
                  <div className="w-20 sm:w-24 aspect-[4/3] flex-shrink-0 rounded-sm bg-ivory-100 flex items-center justify-center text-charcoal-300 text-xs font-sans">
                    <span aria-label="Imagen no disponible">—</span>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-serif text-xl text-charcoal-800">{s.titulo}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-sans ${s.activo ? 'bg-sage-100 text-sage-700' : 'bg-gray-100 text-gray-500'}`}>
                      {s.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <p className="text-charcoal-500 text-sm leading-relaxed line-clamp-2">{s.descripcion}</p>
                  <p className="text-xs text-charcoal-400 mt-2 font-sans">{s.bloques.length} bloques</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-ivory-100">
                <button
                  onClick={() => toggleActivo(s.id, s.activo)}
                  className={`text-xs px-3 py-1.5 rounded border font-sans transition-colors ${
                    s.activo
                      ? 'border-sage-200 text-sage-600 hover:bg-sage-50'
                      : 'border-charcoal-200 text-charcoal-500 hover:bg-ivory-100'
                  }`}
                >
                  {s.activo ? 'Ocultar' : 'Publicar'}
                </button>
                <button
                  onClick={() => openBlocks(s)}
                  className="text-xs px-3 py-1.5 rounded border border-ivory-200 text-charcoal-600 hover:border-sage-300 transition-colors font-sans"
                >
                  Bloques ({s.bloques.length})
                </button>
                <button
                  onClick={() => openEdit(s)}
                  className="text-xs px-3 py-1.5 rounded border border-ivory-200 text-charcoal-600 hover:border-sage-300 transition-colors font-sans"
                >
                  Editar
                </button>
                <button
                  onClick={() => deleteService(s.id)}
                  className="text-xs px-3 py-1.5 rounded border border-red-100 text-red-500 hover:bg-red-50 transition-colors font-sans"
                >
                  Eliminar
                </button>
                {(s.imagenes && s.imagenes.length > 1) && (
                  <button
                    onClick={() => {
                      setSelected(s);
                      setModal('setMainImage');
                    }}
                    className="text-xs px-3 py-1.5 rounded border border-sage-200 text-sage-600 hover:bg-sage-50 transition-colors font-sans"
                  >
                    Cambiar imagen principal
                  </button>
                )}
              </div>

              {s.bloques.length > 0 && (
                <div className="mt-3">
                  <div className="flex flex-wrap gap-2">
                    {s.bloques.map((b) => (
                      <span key={b.id} className="text-xs bg-ivory-100 text-charcoal-600 px-3 py-1 rounded-full font-sans">
                        {b.titulo}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal crear/editar servicio */}
      <Modal
        isOpen={modal === 'createService' || modal === 'editService'}
        onClose={() => setModal(null)}
        title={modal === 'createService' ? 'Nuevo servicio' : 'Editar servicio'}
        dismissOnBackdrop={false}
      >
        <div className="space-y-4">
          <div>
            <label className="form-label">Título *</label>
            <input
              className="input-field"
              value={formS.titulo}
              maxLength={MAX_TITULO}
              onChange={(e) => setFormS({ ...formS, titulo: e.target.value })}
              placeholder="Ej: Diseño Floral Personalizado"
            />
            <div className="flex justify-between mt-1">
              {fieldErrors.titulo ? (
                <span className="text-xs text-red-500 font-sans">{fieldErrors.titulo}</span>
              ) : <span />}
              <span className="text-xs text-charcoal-400 font-sans">{formS.titulo.length} / {MAX_TITULO}</span>
            </div>
          </div>

          <div>
            <label className="form-label">Descripción</label>
            <textarea
              className="input-field resize-none"
              rows={4}
              value={formS.descripcion}
              maxLength={MAX_DESCRIPCION}
              onChange={(e) => setFormS({ ...formS, descripcion: e.target.value })}
              placeholder="Descripción del servicio..."
            />
            <div className="flex justify-between mt-1">
              {fieldErrors.descripcion ? (
                <span className="text-xs text-red-500 font-sans">{fieldErrors.descripcion}</span>
              ) : <span />}
              <span className="text-xs text-charcoal-400 font-sans">{formS.descripcion.length} / {MAX_DESCRIPCION}</span>
            </div>
          </div>

          <div>
            <label className="form-label">Imágenes y vídeos</label>
            <ImageUploader
              images={formS.imagenes}
              uploadFn={servicesApi.uploadImage}
              onChange={(newImages) => setFormS({ ...formS, imagenes: newImages })}
              maxImages={10}
              acceptVideos={true}
              disabled={saving}
            />
            <p className="text-xs text-charcoal-400 mt-1 font-sans">
              <strong>Nota:</strong> Se mostrará la primera imagen como principal. Para ver todas las imágenes, necesitas aplicar la migración de la base de datos.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="activo-toggle"
              type="checkbox"
              checked={formS.activo}
              onChange={(e) => setFormS({ ...formS, activo: e.target.checked })}
              className="h-4 w-4"
            />
            <label htmlFor="activo-toggle" className="text-sm text-charcoal-700 font-sans cursor-pointer">
              Servicio activo (visible al público)
            </label>
          </div>

          <div>
            <label className="form-label">Orden</label>
            <input
              type="number"
              min={1}
              className="input-field"
              value={formS.orden}
              onChange={(e) => setFormS({ ...formS, orden: Number(e.target.value) || 1 })}
            />
            {fieldErrors.orden && (
              <p className="text-xs text-red-500 mt-1 font-sans">{fieldErrors.orden}</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={saveService} disabled={saving || !formS.titulo.trim()} className="btn-primary flex-1">
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
            <button onClick={() => setModal(null)} className="btn-secondary flex-1">Cancelar</button>
          </div>
        </div>
      </Modal>

      {/* Modal gestionar bloques */}
      <Modal
        isOpen={modal === 'manageBlocks'}
        onClose={() => setModal(null)}
        title={`Bloques de "${selected?.titulo ?? ''}"`}
        dismissOnBackdrop={false}
      >
        {selected && (
          <div className="space-y-6">
            {selected.bloques.length === 0 ? (
              <p className="text-charcoal-400 text-sm font-sans text-center py-4">Sin bloques todavía.</p>
            ) : (
              <ul className="space-y-3">
                {selected.bloques.map((b) => (
                  <li key={b.id} className="p-3 bg-ivory-50 rounded text-sm space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-medium text-charcoal-700">{b.titulo}</span>
                        {b.descripcion && <span className="text-charcoal-400 ml-2">— {b.descripcion}</span>}
                      </div>
                      <button
                        onClick={async () => {
                          const currentSelected = selected;
                          if (!currentSelected) return;
                          if (!window.confirm(`¿Eliminar bloque "${b.titulo}"?`)) return;
                          try {
                            await blocksApi.remove(b.id);
                            success('Bloque eliminado');
                            const updated = await servicesApi.get(currentSelected.id);
                            setSelected(updated);
                            fetchServices();
                          } catch {
                            toastError('Error al eliminar el bloque');
                          }
                        }}
                        className="text-xs text-red-400 hover:text-red-600 transition-colors font-sans flex-shrink-0"
                      >
                        ✕
                      </button>
                    </div>
                    <div>
                      <p className="text-xs text-charcoal-400 font-sans mb-2">Imágenes y vídeos del bloque</p>
                      <ImageUploader
                        images={b.imagenes ?? []}
                        uploadFn={servicesApi.uploadImage}
                        disabled={!!blockSaving[b.id]}
                        onChange={async (newImages) => {
                          setBlockSaving(prev => ({ ...prev, [b.id]: true }));
                          try {
                            await blocksApi.update(b.id, { imagenes: newImages });
                            const updated = await servicesApi.get(selected!.id);
                            setSelected(updated);
                          } catch {
                            toastError('Error al actualizar los archivos del bloque');
                          } finally {
                            setBlockSaving(prev => ({ ...prev, [b.id]: false }));
                          }
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* Añadir bloque */}
            <div className="border-t border-ivory-100 pt-4 space-y-3">
              <p className="text-xs uppercase tracking-wider text-charcoal-400 font-sans">Añadir bloque</p>
              <input
                className="input-field"
                placeholder="Título del bloque *"
                value={formB.titulo}
                onChange={(e) => setFormB({ ...formB, titulo: e.target.value })}
              />
              <input
                className="input-field"
                placeholder="Descripción"
                value={formB.descripcion}
                onChange={(e) => setFormB({ ...formB, descripcion: e.target.value })}
              />
              <button
                disabled={saving || !formB.titulo.trim()}
                className="btn-primary w-full text-sm"
                onClick={async () => {
                  if (!formB.titulo.trim() || !selected) return;
                  const currentSelected = selected;
                  setSaving(true);
                  try {
                    await blocksApi.create({
                      titulo: formB.titulo.trim(),
                      descripcion: formB.descripcion.trim(),
                      servicioId: currentSelected.id,
                    });
                    success('Bloque añadido');
                    setFormB({ titulo: '', descripcion: '', orden: currentSelected.bloques.length + 2 });
                    fetchServices();
                    const updated = await servicesApi.get(currentSelected.id);
                    setSelected(updated);
                  } catch {
                    toastError('Error al añadir el bloque');
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                Añadir bloque
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal para cambiar imagen principal */}
      <Modal
        isOpen={modal === 'setMainImage'}
        onClose={() => setModal(null)}
        title="Cambiar imagen principal"
        dismissOnBackdrop={false}
      >
        {selected && (
          <div className="space-y-4">
            <p className="text-sm text-charcoal-600 mb-4">
              Selecciona qué imagen será la principal del servicio.
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {selected.imagenes?.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setMainImage(selected.id, index)}
                  className={`relative aspect-square rounded-sm overflow-hidden border-2 transition-all ${
                    index === 0 
                      ? 'border-sage-400 ring-2 ring-sage-400' 
                      : 'border-ivory-200 hover:border-sage-300'
                  }`}
                >
                  <div className="relative w-full h-full">
                    {isVideoUrl(img) ? (
                      <video
                        src={resolveMedia(img)}
                        className="w-full h-full object-cover"
                        muted
                        preload="metadata"
                      />
                    ) : (
                      <img
                        src={resolveMedia(img)}
                        alt={`Imagen ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {index === 0 && (
                      <div className="absolute top-1 left-1 bg-sage-600 text-white text-xs px-1.5 py-0.5 rounded">
                        Principal
                      </div>
                    )}
                  </div>
                ))}
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setModal(null)}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
