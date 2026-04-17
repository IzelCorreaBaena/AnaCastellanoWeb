import { createPortal } from 'react-dom';
import { useToast } from '@hooks/useToast';

export default function ToastContainer() {
  const { toasts, hide } = useToast();

  if (toasts.length === 0) return null;

  return createPortal(
    <div className="toast-container fixed top-6 right-6 z-toast flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`toast toast--${t.type} pointer-events-auto animate-slide-in-right flex items-start gap-3`}
        >
          <span className="toast__message flex-1">{t.message}</span>
          <button
            type="button"
            aria-label="Cerrar notificación"
            className="text-charcoal-600 hover:text-charcoal-900 leading-none text-lg"
            onClick={() => hide(t.id)}
          >
            &times;
          </button>
        </div>
      ))}
    </div>,
    document.body
  );
}
