import { useEffect, useRef, useState } from 'react';
import { servicesApi } from '@services/services.api';
import { blocksApi } from '@services/blocks.api';
import type { Servicio } from '@app-types/models';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useToast } from '../../hooks/useToast';

type ModalMode = 'createService' | 'editService' | 'manageBlocks' | null;

interface ZodIssue {
  path: (string | number)[];
  message: string;
}

interface FieldErrors {
  titulo?: string;
  descripcion?: string;
  imagenes?: string;
  videos?: string;
  orden?: string;
  activo?: string;
}

const MAX_TITULO = 150;
const MAX_DESCRIPCION = 5000;

// ─── Media gallery component ──────────────────────────────────────────────────

interface MediaGalleryProps {
  imagenes: string[];
  videos: string[];
  onRemoveImage: (idx: number) => void;
  onRemoveVideo: (idx: number) => void;
  onAddImages: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddVideos: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
  uploadingVideo: boolean;
}

function MediaGallery({
  imagenes,
  videos,
  onRemoveImage,
  onRemoveVideo,
  onAddImages,
  onAddVideos,
  uploading,
  uploadingVideo,
}: MediaGalleryProps) {
  const imgInputRef = useRef<HTMLInputElement | null>(null);
  const vidInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="space-y-4">
      {/* Grid de imágenes */}
      {imagenes.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {imagenes.map((url, idx) => (
            <div key={idx} className="relative group aspect-[4/3] overflow-hidden rounded bg-ivory-100 border border-ivory-200">
              <img
                src={url}
                alt={`Imagen ${idx + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
              <button
                type="button"
                onClick={() => onRemoveImage(idx)}
                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Eliminar imagen"
              >
                ✕
              </button>
              <span className="absolute bottom-1 left-1 text-[10px] bg-black/50 text-white px-1 rounded font-sans">
                IMG
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Grid de vídeos */}
      {videos.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {videos.map((url, idx) => (
            <div key={idx} className="relative group aspect-video overflow-hidden rounded bg-charcoal-900 border border-ivory-200">
              <video
                src={url}
                className="w-full h-full object-cover"
                muted
                playsInline
                preload="metadata"
              />
              <button
                type="button"
                onClick={() => onRemoveVideo(idx)}
                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Eliminar vídeo"
              >
                ✕
              </button>
              <span className="absolute bottom-1 left-1 text-[10px] bg-black/50 text-white px-1 rounded font-sans">
                VÍD
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Botones de subida */}
      <div className="flex flex-wrap gap-2">
        <div>
          <input
            ref={imgInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={onAddImages}
            disabled={uploading}
            className="hidden"
            id="img-upload"
          />
          <label
            htmlFor="img-upload"
            className={`inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded border font-sans cursor-pointer transition-colors ${
              uploading
                ? 'border-ivory-200 text-charcoal-300 bg-ivory-50 cursor-not-allowed'
                : 'border-sage-300 text-sage-700 bg-sage-50 hover:bg-sage-100'
            }`}
          >
            {uploading ? (
              <><LoadingSpinner size="sm" /> Subiendo...</>
            ) : (
              <>📷 Añadir imágenes</>
            )}
          </label>
        </div>

        <div>
          <input
            ref={vidInputRef}
            type="file"
            accept="video/mp4,video/webm,video/ogg,video/quicktime"
            multiple
            onChange={onAddVideos}
            disabled={uploadingVideo}
            className="hidden"
            id="vid-upload"
          />
          <label
            htmlFor="vid-upload"
            className={`inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded border font-sans cursor-pointer transition-colors ${
              uploadingVideo
                ? 'border-ivory-200 text-charcoal-300 bg-ivory-50 cursor-not-allowed'
                : 'border-blush-300 text-blush-700 bg-blush-50 hover:bg-blush-100'
            }`}
          >
            {uploadingVideo ? (
              <><LoadingSpinner size="sm" /> Subiendo...</>
            ) : (
              <>🎬 Añadir vídeos</>
            )}
          </label>
        </div>
      </div>

      <p className="text-[11px] text-charcoal-400 font-sans">
        Imágenes: JPEG, PNG, WebP (máx. 10 MB c/u) · Vídeos: MP4, WebM, MOV (máx. 100 MB c/u)
      </p>
    </div>
  );
}

// ─── Block media gallery (inline, simpler) ────────────────────────────────────

interface BlockMediaProps {
  imagenes: string[];
  videos: string[];
  onRemoveImage: (idx: number) => void;
  onRemoveVideo: (idx: number) => void;
  onAddImages: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddVideos: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
  uploadingVideo: boolean;
}

function BlockMedia({
  imagenes,
  videos,
  onRemoveImage,
  onRemoveVideo,
  onAddImages,
  onAddVideos,
  uploading,
  uploadingVideo,
}: BlockMediaProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-wider text-charcoal-400 font-sans">
        Media del bloque
      </p>

      {(imagenes.length > 0 || videos.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {imagenes.map((url, idx) => (
            <div key={`img-${idx}`} className="relative group w-16 aspect-square overflow-hidden rounded bg-ivory-100 border border-ivory-200">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => onRemoveImage(idx)}
                className="absolute inset-0 bg-red-500/70 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </div>
          ))}
          {videos.map((_url, idx) => (
            <div key={`vid-${idx}`} className="relative group w-16 aspect-square overflow-hidden rounded bg-charcoal-800 border border-ivory-200 flex items-center justify-center">
              <span className="text-white text-xs font-sans">🎬</span>
              <button
                type="button"
                onClick={() => onRemoveVideo(idx)}
                className="absolute inset-0 bg-red-500/70 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <div>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={onAddImages}
            disabled={uploading}
            className="hidden"
            id="bloque-img-upload"
          />
          <label
            htmlFor="bloque-img-upload"
            className={`inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded border font-sans cursor-pointer transition-colors ${
              uploading ? 'border-ivory-200 text-charcoal-300' : 'border-sage-200 text-sage-600 hover:bg-sage-50'
            }`}
          >
            {uploading ? <LoadingSpinner size="sm" /> : '📷'} Imágenes
          </label>
        </div>
        <div>
          <input
            type="file"
            accept="video/mp4,video/webm,video/ogg,video/quicktime"
            multiple
            onChange={onAddVideos}
            disabled={uploadingVideo}
            className="hidden"
            id="bloque-vid-upload"
          />
          <label
            htmlFor="bloque-vid-upload"
            className={`inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded border font-sans cursor-pointer transition-colors ${
              uploadingVideo ? 'border-ivory-200 text-charcoal-300' : 'border-blush-200 text-blush-600 hover:bg-blush-50'
            }`}
          >
            {uploadingVideo ? <LoadingSpinner size="sm" /> : '🎬'} Vídeos
          </label>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AdminServices() {
  const { success, error: toastError } = useToast();
  const [services, setServices] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalMode>(null);
  const [selected, setSelected] = useState<Servicio | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [blockUploading, setBlockUploading] = useState(false);
  const [blockUploadingVideo, setBlockUploadingVideo] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // Form servicio
  const [formS, setFormS] = useState({
    titulo: '',
    descripcion: '',
    imagenes: [] as string[],
    videos: [] as string[],
    activo: true,
    orden: 1,
  });

  // Form bloque
  const [formB, setFormB] = useState({
    titulo: '',
    descripcion: '',
    imagenes: [] as string[],
    videos: [] as string[],
    orden: 1,
  });

  const fetchServices = () => {
    setLoading(true);
    servicesApi.listAll()
      .then((data) => setServices(data))
      .catch(() => toastError('Error al cargar servicios'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchServices(); }, []);

  const resetForm = () => {
    setFormS({ titulo: '', descripcion: '', imagenes: [], videos: [], activo: true, orden: 1 });
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
      imagenes: [...s.imagenes],
      videos: [...s.videos],
      activo: s.activo,
      orden: s.orden ?? 1,
    });
    setFieldErrors({});
    setSelected(s);
    setModal('editService');
  };

  const openBlocks = (s: Servicio) => {
    setSelected(s);
    setFormB({ titulo: '', descripcion: '', imagenes: [], videos: [], orden: s.bloques.length + 1 });
    setModal('manageBlocks');
  };

  const parseFieldErrors = (err: unknown): FieldErrors => {
    const out: FieldErrors = {};
    const response = (err as { response?: { data?: { issues?: ZodIssue[] } } })?.response;
    const issues = response?.data?.issues;
    if (Array.isArray(issues)) {
      for (const issue of issues) {
        const key = issue.path?.[0];
        if (typeof key === 'string' && key in ({ titulo: 1, descripcion: 1, imagenes: 1, videos: 1, orden: 1, activo: 1 } as Record<string, number>)) {
          (out as Record<string, string>)[key] = issue.message;
        }
      }
    }
    return out;
  };

  // Upload multiple images for service form
  const handleServiceImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = await Promise.all(files.map((f) => servicesApi.uploadImage(f).then((r) => r.url)));
      setFormS((prev) => ({ ...prev, imagenes: [...prev.imagenes, ...urls] }));
      success(`${urls.length} imagen${urls.length > 1 ? 'es' : ''} subida${urls.length > 1 ? 's' : ''}`);
    } catch {
      toastError('Error al subir las imágenes');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // Upload multiple videos for service form
  const handleServiceVideos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploadingVideo(true);
    try {
      const urls = await Promise.all(files.map((f) => servicesApi.uploadVideo(f).then((r) => r.url)));
      setFormS((prev) => ({ ...prev, videos: [...prev.videos, ...urls] }));
      success(`${urls.length} vídeo${urls.length > 1 ? 's' : ''} subido${urls.length > 1 ? 's' : ''}`);
    } catch {
      toastError('Error al subir los vídeos');
    } finally {
      setUploadingVideo(false);
      e.target.value = '';
    }
  };

  // Upload multiple images for block form
  const handleBlockImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setBlockUploading(true);
    try {
      const urls = await Promise.all(files.map((f) => servicesApi.uploadImage(f).then((r) => r.url)));
      setFormB((prev) => ({ ...prev, imagenes: [...prev.imagenes, ...urls] }));
      success(`${urls.length} imagen${urls.length > 1 ? 'es' : ''} subida${urls.length > 1 ? 's' : ''}`);
    } catch {
      toastError('Error al subir las imágenes');
    } finally {
      setBlockUploading(false);
      e.target.value = '';
    }
  };

  // Upload multiple videos for block form
  const handleBlockVideos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setBlockUploadingVideo(true);
    try {
      const urls = await Promise.all(files.map((f) => servicesApi.uploadVideo(f).then((r) => r.url)));
      setFormB((prev) => ({ ...prev, videos: [...prev.videos, ...urls] }));
      success(`${urls.length} vídeo${urls.length > 1 ? 's' : ''} subido${urls.length > 1 ? 's' : ''}`);
    } catch {
      toastError('Error al subir los vídeos');
    } finally {
      setBlockUploadingVideo(false);
      e.target.value = '';
    }
  };

  const saveService = async () => {
    if (!formS.titulo.trim()) return;
    setSaving(true);
    setFieldErrors({});
    const payload = {
      titulo: formS.titulo,
      descripcion: formS.descripcion,
      imagenes: formS.imagenes,
      videos: formS.videos,
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-charcoal-800">Servicios</h1>
          <p className="text-charcoal-500 mt-1 font-sans text-sm">{services.length} servicios publicados</p>
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
            <div key={s.id} className="bg-white rounded-sm border border-ivory-200 p-6">
              <div className="flex items-start justify-between gap-4">

                {/* Preview de media */}
                {(s.imagenes.length > 0 || s.videos.length > 0) && (
                  <div className="flex gap-1.5 flex-shrink-0">
                    {s.imagenes.slice(0, 3).map((url, i) => (
                      <div key={i} className="w-14 aspect-square overflow-hidden rounded-sm bg-ivory-100">
                        <img
                          src={url}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                        />
                      </div>
                    ))}
                    {s.videos.slice(0, 1).map((_, i) => (
                      <div key={i} className="w-14 aspect-square overflow-hidden rounded-sm bg-charcoal-800 flex items-center justify-center">
                        <span className="text-white text-lg">🎬</span>
                      </div>
                    ))}
                    {(s.imagenes.length + s.videos.length) > 4 && (
                      <div className="w-14 aspect-square rounded-sm bg-ivory-100 flex items-center justify-center text-xs text-charcoal-500 font-sans">
                        +{s.imagenes.length + s.videos.length - 4}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-serif text-xl text-charcoal-800">{s.titulo}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-sans ${s.activo ? 'bg-sage-100 text-sage-700' : 'bg-gray-100 text-gray-500'}`}>
                      {s.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <p className="text-charcoal-500 text-sm leading-relaxed line-clamp-2">{s.descripcion}</p>
                  <div className="flex gap-3 mt-2">
                    <p className="text-xs text-charcoal-400 font-sans">{s.bloques.length} bloques</p>
                    {s.imagenes.length > 0 && (
                      <p className="text-xs text-charcoal-400 font-sans">{s.imagenes.length} imagen{s.imagenes.length !== 1 ? 'es' : ''}</p>
                    )}
                    {s.videos.length > 0 && (
                      <p className="text-xs text-charcoal-400 font-sans">{s.videos.length} vídeo{s.videos.length !== 1 ? 's' : ''}</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => openBlocks(s)}
                    className="text-xs px-3 py-1.5 rounded border border-ivory-200 text-charcoal-600 hover:border-sage-300 transition-colors font-sans"
                  >
                    Bloques
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
                </div>
              </div>

              {s.bloques.length > 0 && (
                <div className="mt-4 pt-4 border-t border-ivory-100">
                  <div className="flex flex-wrap gap-2">
                    {s.bloques.map((b) => (
                      <span key={b.id} className="text-xs bg-ivory-100 text-charcoal-600 px-3 py-1 rounded-full font-sans">
                        {b.titulo}
                        {(b.imagenes.length > 0 || b.videos.length > 0) && (
                          <span className="ml-1 text-charcoal-400">
                            {b.imagenes.length > 0 && `📷${b.imagenes.length}`}
                            {b.videos.length > 0 && ` 🎬${b.videos.length}`}
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Modal crear/editar servicio ─────────────────────────────────── */}
      <Modal
        isOpen={modal === 'createService' || modal === 'editService'}
        onClose={() => setModal(null)}
        title={modal === 'createService' ? 'Nuevo servicio' : 'Editar servicio'}
        dismissOnBackdrop={false}
      >
        <div className="space-y-5">
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
            <MediaGallery
              imagenes={formS.imagenes}
              videos={formS.videos}
              onRemoveImage={(idx) => setFormS((p) => ({ ...p, imagenes: p.imagenes.filter((_, i) => i !== idx) }))}
              onRemoveVideo={(idx) => setFormS((p) => ({ ...p, videos: p.videos.filter((_, i) => i !== idx) }))}
              onAddImages={handleServiceImages}
              onAddVideos={handleServiceVideos}
              uploading={uploading}
              uploadingVideo={uploadingVideo}
            />
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
            <button onClick={saveService} disabled={saving || uploading || uploadingVideo || !formS.titulo.trim()} className="btn-primary flex-1">
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
            <button onClick={() => setModal(null)} className="btn-secondary flex-1">Cancelar</button>
          </div>
        </div>
      </Modal>

      {/* ── Modal gestionar bloques ────────────────────────────────────── */}
      <Modal
        isOpen={modal === 'manageBlocks'}
        onClose={() => setModal(null)}
        title={`Bloques de "${selected?.titulo ?? ''}"`}
        dismissOnBackdrop={false}
      >
        {selected && (
          <div className="space-y-6">
            {/* Lista bloques existentes */}
            {selected.bloques.length === 0 ? (
              <p className="text-charcoal-400 text-sm font-sans text-center py-4">Sin bloques todavía.</p>
            ) : (
              <ul className="space-y-2">
                {selected.bloques.map((b) => (
                  <li key={b.id} className="flex items-start justify-between p-3 bg-ivory-50 rounded text-sm gap-3">
                    <div className="min-w-0">
                      <span className="font-medium text-charcoal-700">{b.titulo}</span>
                      {b.descripcion && <span className="text-charcoal-400 ml-2 text-xs">— {b.descripcion}</span>}
                      {(b.imagenes.length > 0 || b.videos.length > 0) && (
                        <div className="flex gap-2 mt-1">
                          {b.imagenes.length > 0 && (
                            <span className="text-[11px] text-charcoal-400 font-sans">📷 {b.imagenes.length}</span>
                          )}
                          {b.videos.length > 0 && (
                            <span className="text-[11px] text-charcoal-400 font-sans">🎬 {b.videos.length}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={async () => {
                        const cur = selected;
                        if (!cur) return;
                        if (!window.confirm(`¿Eliminar bloque "${b.titulo}"?`)) return;
                        try {
                          await blocksApi.remove(b.id);
                          success('Bloque eliminado');
                          const updated = await servicesApi.get(cur.id);
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

              <BlockMedia
                imagenes={formB.imagenes}
                videos={formB.videos}
                onRemoveImage={(idx) => setFormB((p) => ({ ...p, imagenes: p.imagenes.filter((_, i) => i !== idx) }))}
                onRemoveVideo={(idx) => setFormB((p) => ({ ...p, videos: p.videos.filter((_, i) => i !== idx) }))}
                onAddImages={handleBlockImages}
                onAddVideos={handleBlockVideos}
                uploading={blockUploading}
                uploadingVideo={blockUploadingVideo}
              />

              <button
                disabled={saving || blockUploading || blockUploadingVideo || !formB.titulo.trim()}
                className="btn-primary w-full text-sm"
                onClick={async () => {
                  if (!formB.titulo.trim() || !selected) return;
                  const cur = selected;
                  setSaving(true);
                  try {
                    await blocksApi.create({
                      titulo: formB.titulo.trim(),
                      descripcion: formB.descripcion.trim(),
                      imagenes: formB.imagenes,
                      videos: formB.videos,
                      servicioId: cur.id,
                    });
                    success('Bloque añadido');
                    setFormB({ titulo: '', descripcion: '', imagenes: [], videos: [], orden: cur.bloques.length + 2 });
                    fetchServices();
                    const updated = await servicesApi.get(cur.id);
                    setSelected(updated);
                  } catch {
                    toastError('Error al añadir el bloque');
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                {saving ? 'Añadiendo...' : 'Añadir bloque'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
