import { useRef, useState } from 'react';

const API_ORIGIN = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/api$/, '')
  : 'http://localhost:4000';
const resolveImg = (src: string) =>
  src.startsWith('http') ? src : `${API_ORIGIN}${src}`;

interface ImageUploaderProps {
  images: string[];
  onChange: (newImages: string[]) => void;
  uploadFn: (file: File) => Promise<{ url: string }>;
  maxImages?: number;
}

export default function ImageUploader({
  images,
  onChange,
  uploadFn,
  maxImages = 10,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const { url } = await uploadFn(file);
      onChange([...images, url]);
    } catch {
      setUploadError('Error al subir la imagen. Inténtalo de nuevo.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div>
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {images.map((url, i) => (
            <div
              key={i}
              className="relative w-20 h-20 rounded-sm overflow-hidden bg-ivory-100 flex-shrink-0"
            >
              <img
                src={resolveImg(url)}
                alt={`Imagen ${i + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.opacity = '0.3';
                }}
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600 leading-none"
                aria-label={`Eliminar imagen ${i + 1}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length < maxImages && (
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFile}
            disabled={uploading}
            className="sr-only"
          />
          <span
            className={`px-3 py-1.5 border border-ivory-200 rounded text-xs font-sans transition-colors ${
              uploading
                ? 'text-charcoal-400 cursor-not-allowed'
                : 'text-charcoal-600 hover:border-sage-300 hover:text-charcoal-800 cursor-pointer'
            }`}
          >
            {uploading ? 'Subiendo...' : '+ Añadir imagen'}
          </span>
        </label>
      )}

      {uploadError && (
        <p className="text-xs text-red-500 mt-1 font-sans">{uploadError}</p>
      )}
    </div>
  );
}
