import { useRef, useState } from 'react';

const API_ORIGIN = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/api$/, '')
  : 'http://localhost:4000';

const resolveMedia = (src: string) =>
  src.startsWith('http') ? src : `${API_ORIGIN}${src}`;

const isVideoUrl = (url: string): boolean =>
  /\/video\/upload\//.test(url) ||
  /\.(mp4|webm|mov|avi|mkv)(\?|$)/i.test(url);

const ACCEPT_ALL = 'image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime';
const ACCEPT_IMAGES = 'image/jpeg,image/png,image/webp';

interface ImageUploaderProps {
  images: string[];
  onChange: (newImages: string[]) => void;
  uploadFn: (file: File) => Promise<{ url: string }>;
  maxImages?: number;
  acceptVideos?: boolean;
}

export default function ImageUploader({
  images,
  onChange,
  uploadFn,
  maxImages = 10,
  acceptVideos = true,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const remaining = maxImages - images.length;
    const toUpload = files.slice(0, remaining);

    setUploading(true);
    setUploadError(null);

    const newUrls: string[] = [];
    for (let i = 0; i < toUpload.length; i++) {
      if (toUpload.length > 1) {
        setUploadProgress(`${i + 1} / ${toUpload.length}`);
      }
      try {
        const { url } = await uploadFn(toUpload[i]);
        newUrls.push(url);
      } catch {
        setUploadError('Error al subir un archivo. Comprueba el formato y el tamaño.');
        break;
      }
    }

    if (newUrls.length > 0) {
      onChange([...images, ...newUrls]);
    }

    setUploading(false);
    setUploadProgress(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const removeItem = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const accept = acceptVideos ? ACCEPT_ALL : ACCEPT_IMAGES;

  return (
    <div>
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
          {images.map((url, i) => {
            const video = isVideoUrl(url);
            return (
              <div
                key={i}
                className="relative aspect-square rounded-sm overflow-hidden bg-ivory-100 group"
              >
                {video ? (
                  <>
                    <video
                      src={resolveMedia(url)}
                      className="w-full h-full object-cover"
                      muted
                      preload="metadata"
                      onError={(e) => {
                        (e.currentTarget as HTMLVideoElement).style.opacity = '0.3';
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
                          <path d="M3 2.5l6 3.5-6 3.5V2.5z" />
                        </svg>
                      </div>
                    </div>
                  </>
                ) : (
                  <img
                    src={resolveMedia(url)}
                    alt={`Imagen ${i + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.opacity = '0.3';
                    }}
                  />
                )}
                {i === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 text-center text-white text-[9px] font-sans font-medium bg-black/40 py-0.5 leading-tight">
                    Principal
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600 leading-none opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`Eliminar ${video ? 'vídeo' : 'imagen'} ${i + 1}`}
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}

      {images.length < maxImages && (
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple
            onChange={handleFiles}
            disabled={uploading}
            className="sr-only"
          />
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 border border-ivory-200 rounded text-xs font-sans transition-colors ${
              uploading
                ? 'text-charcoal-400 cursor-not-allowed'
                : 'text-charcoal-600 hover:border-sage-300 hover:text-charcoal-800 cursor-pointer'
            }`}
          >
            {uploading ? (
              <>
                <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="8" />
                </svg>
                {uploadProgress ? `Subiendo ${uploadProgress}…` : 'Subiendo…'}
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M8 3v10M3 8h10" strokeLinecap="round" />
                </svg>
                {acceptVideos ? 'Añadir imágenes o vídeos' : 'Añadir imágenes'}
              </>
            )}
          </span>
        </label>
      )}

      {images.length >= maxImages && (
        <p className="text-xs text-charcoal-400 font-sans">
          Máximo {maxImages} archivos
        </p>
      )}

      {uploadError && (
        <p className="text-xs text-red-500 mt-1 font-sans">{uploadError}</p>
      )}

      {acceptVideos && (
        <p className="text-xs text-charcoal-400 mt-1 font-sans">
          Imágenes: JPEG, PNG, WebP (máx. 5 MB) · Vídeos: MP4, WebM, MOV (máx. 100 MB)
        </p>
      )}
    </div>
  );
}
