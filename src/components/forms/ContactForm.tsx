import { useState, type FormEvent } from 'react';
import { contactoApi } from '@services/contacto.api';

interface ContactFormProps {
  onSuccess?: () => void;
}

interface FormState {
  nombre: string;
  email: string;
  telefono: string;
  mensaje: string;
}

type FieldErrors = Partial<Record<keyof FormState, string>>;

// Sanitizers: strip disallowed chars on input.
const sanitizeName = (v: string): string =>
  v.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s-]/g, '');
const sanitizePhone = (v: string): string => v.replace(/[^0-9+\s-]/g, '');
const sanitizeText = (v: string): string =>
  v.replace(/[^A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ\s,.!?\-'"\n\r:;]/g, '');

const INITIAL: FormState = { nombre: '', email: '', telefono: '', mensaje: '' };

function validate(state: FormState): FieldErrors {
  const errors: FieldErrors = {};
  if (!state.nombre.trim()) errors.nombre = 'Indícanos tu nombre.';
  if (!state.email.trim()) {
    errors.email = 'El email es obligatorio.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) {
    errors.email = 'Introduce un email válido.';
  }
  if (!state.mensaje.trim()) errors.mensaje = 'Escribe un mensaje.';
  return errors;
}

type Status = 'idle' | 'sending' | 'sent' | 'error';

export default function ContactForm({ onSuccess }: ContactFormProps) {
  const [state, setState] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const update = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setState((s) => ({ ...s, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const v = validate(state);
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    setStatus('sending');
    setErrorMessage(null);

    try {
      await contactoApi.send({
        nombre: state.nombre.trim(),
        email: state.email.trim(),
        telefono: state.telefono.trim() || undefined,
        mensaje: state.mensaje.trim(),
      });
      setStatus('sent');
      setState(INITIAL);
      onSuccess?.();
    } catch {
      setStatus('error');
      setErrorMessage(
        'No hemos podido enviar tu mensaje. Por favor, inténtalo de nuevo en unos minutos.',
      );
    }
  };

  const isSending = status === 'sending';

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {status === 'sent' && (
        <p
          role="status"
          className="text-sm text-sage-700 bg-sage-50 border border-sage-200 rounded px-4 py-3"
        >
          Gracias por tu mensaje. Te responderemos lo antes posible.
        </p>
      )}

      {status === 'error' && errorMessage && (
        <p
          role="alert"
          className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-4 py-3"
        >
          {errorMessage}
        </p>
      )}

      <div className="form-group">
        <label htmlFor="contact-nombre" className="form-label">Nombre *</label>
        <input
          id="contact-nombre"
          type="text"
          autoComplete="name"
          className={`input-field ${errors.nombre ? 'input-error' : ''}`}
          value={state.nombre}
          onChange={(e) => update('nombre', sanitizeName(e.target.value))}
          disabled={isSending}
        />
        {errors.nombre && <p className="form-error">{errors.nombre}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="contact-email" className="form-label">Email *</label>
        <input
          id="contact-email"
          type="email"
          autoComplete="email"
          className={`input-field ${errors.email ? 'input-error' : ''}`}
          value={state.email}
          onChange={(e) => update('email', e.target.value)}
          disabled={isSending}
        />
        {errors.email && <p className="form-error">{errors.email}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="contact-telefono" className="form-label">Teléfono</label>
        <input
          id="contact-telefono"
          type="tel"
          autoComplete="tel"
          className="input-field"
          value={state.telefono}
          onChange={(e) => update('telefono', sanitizePhone(e.target.value))}
          disabled={isSending}
          placeholder="Opcional"
        />
      </div>

      <div className="form-group">
        <label htmlFor="contact-mensaje" className="form-label">Mensaje *</label>
        <textarea
          id="contact-mensaje"
          rows={5}
          className={`input-field ${errors.mensaje ? 'input-error' : ''}`}
          value={state.mensaje}
          onChange={(e) => update('mensaje', sanitizeText(e.target.value))}
          disabled={isSending}
        />
        {errors.mensaje && <p className="form-error">{errors.mensaje}</p>}
      </div>

      <button
        type="submit"
        disabled={isSending}
        className="btn-primary btn-lg btn-full inline-flex items-center justify-center gap-3 disabled:opacity-60"
      >
        {isSending ? 'Enviando…' : 'Enviar mensaje'}
      </button>
    </form>
  );
}
