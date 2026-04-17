import { useEffect, useState, type FormEvent } from 'react';
import { reservationsApi } from '@services/reservations.api';
import { servicesApi } from '@services/services.api';
import { toast } from '@hooks/useToast';
import LoadingSpinner from '@components/ui/LoadingSpinner';

interface ReservationFormProps {
  onSuccess?: () => void;
  /** Pre-seleccionar servicio (ej: ?service=xyz en la URL) */
  initialServiceId?: string;
}

interface ServiceOption {
  id: string;
  name: string;
}

interface FormState {
  nombre: string;
  telefono: string;
  email: string;
  servicioId: string;
  mensaje: string;
  fechaEvento: string;
}

type FieldErrors = Partial<Record<keyof FormState, string>>;

// Sanitizers: strip disallowed chars on input.
const sanitizeName = (v: string): string =>
  v.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s-]/g, '');
const sanitizePhone = (v: string): string => v.replace(/[^\d+\s\-()]/g, '');
const sanitizeText = (v: string): string =>
  v.replace(/[^A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ\s,.!?\-'"\n\r]/g, '');

const INITIAL: FormState = {
  nombre: '',
  telefono: '',
  email: '',
  servicioId: '',
  mensaje: '',
  fechaEvento: '',
};

function validate(state: FormState): FieldErrors {
  const errors: FieldErrors = {};
  if (!state.nombre.trim()) errors.nombre = 'Por favor, indícanos tu nombre.';
  if (!state.email.trim()) {
    errors.email = 'El email es obligatorio.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) {
    errors.email = 'Introduce un email válido.';
  }
  if (state.telefono) {
    if (state.telefono.length > 25) {
      errors.telefono = 'Teléfono demasiado largo (máx. 25 caracteres).';
    } else if (!/^[+]?[\d\s\-.()]{6,25}$/.test(state.telefono)) {
      errors.telefono = 'Teléfono no válido.';
    }
  }
  if (!state.servicioId) errors.servicioId = 'Selecciona un servicio.';
  if (!state.mensaje.trim()) errors.mensaje = 'Cuéntanos un poco sobre tu evento.';
  return errors;
}

export default function ReservationForm({
  onSuccess,
  initialServiceId = '',
}: ReservationFormProps) {
  const [state, setState] = useState<FormState>({
    ...INITIAL,
    servicioId: initialServiceId,
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let active = true;
    servicesApi
      .list()
      .then((data) => {
        if (!active) return;
        setServices(data.map((s) => ({ id: s.id, name: s.titulo })));
      })
      .catch(() => {
        if (active) toast.error('No pudimos cargar los servicios.');
      })
      .finally(() => active && setLoadingServices(false));
    return () => {
      active = false;
    };
  }, []);

  const update = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setState((s) => ({ ...s, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const v = validate(state);
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    setSubmitting(true);
    try {
      await reservationsApi.create({
        nombre: state.nombre,
        email: state.email,
        telefono: state.telefono,
        servicioId: state.servicioId || undefined,
        mensaje: state.mensaje,
        fechaEvento: state.fechaEvento ? new Date(state.fechaEvento).toISOString() : undefined,
      });
      setSuccess(true);
      toast.success('Reserva enviada. Te contactaremos pronto.');
      setState({ ...INITIAL, servicioId: initialServiceId });
      onSuccess?.();
    } catch {
      toast.error('Hubo un problema al enviar la reserva. Inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-12 px-6 bg-ivory-100 border border-ivory-300 rounded-lg animate-fade-in">
        <h3 className="font-serif text-3xl text-charcoal-900 mb-3">
          Gracias por tu solicitud
        </h3>
        <p className="text-charcoal-700 max-w-md mx-auto leading-relaxed">
          Hemos recibido tu reserva. Nos pondremos en contacto contigo en las
          próximas 24-48 horas para confirmar los detalles.
        </p>
        <button
          type="button"
          className="btn-secondary btn-sm mt-6"
          onClick={() => setSuccess(false)}
        >
          Hacer otra reserva
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="form-group">
        <label htmlFor="nombre" className="form-label">Nombre completo *</label>
        <input
          id="nombre"
          type="text"
          autoComplete="name"
          className={`input-field ${errors.nombre ? 'input-error' : ''}`}
          value={state.nombre}
          onChange={(e) => update('nombre', sanitizeName(e.target.value))}
        />
        {errors.nombre && <p className="form-error">{errors.nombre}</p>}
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="form-group">
          <label htmlFor="email" className="form-label">Email *</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={`input-field ${errors.email ? 'input-error' : ''}`}
            value={state.email}
            onChange={(e) => update('email', e.target.value)}
          />
          {errors.email && <p className="form-error">{errors.email}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="telefono" className="form-label">Teléfono</label>
          <input
            id="telefono"
            type="tel"
            autoComplete="tel"
            maxLength={25}
            className={`input-field ${errors.telefono ? 'input-error' : ''}`}
            value={state.telefono}
            onChange={(e) => update('telefono', sanitizePhone(e.target.value))}
          />
          {errors.telefono && <p className="form-error">{errors.telefono}</p>}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="form-group">
          <label htmlFor="servicio" className="form-label">Servicio *</label>
          <select
            id="servicio"
            disabled={loadingServices}
            className={`input-field ${errors.servicioId ? 'input-error' : ''}`}
            value={state.servicioId}
            onChange={(e) => update('servicioId', e.target.value)}
          >
            <option value="">
              {loadingServices ? 'Cargando…' : 'Selecciona un servicio'}
            </option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          {errors.servicioId && <p className="form-error">{errors.servicioId}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="fechaEvento" className="form-label">Fecha del evento</label>
          <input
            id="fechaEvento"
            type="date"
            min={new Date().toLocaleDateString('en-CA')}
            className="input-field"
            value={state.fechaEvento}
            onChange={(e) => update('fechaEvento', e.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="mensaje" className="form-label">Mensaje *</label>
        <textarea
          id="mensaje"
          rows={5}
          className={`input-field ${errors.mensaje ? 'input-error' : ''}`}
          placeholder="Cuéntanos sobre tu evento, estilo deseado, número de invitados…"
          value={state.mensaje}
          onChange={(e) => update('mensaje', sanitizeText(e.target.value))}
        />
        {errors.mensaje && <p className="form-error">{errors.mensaje}</p>}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="btn-primary btn-lg btn-full inline-flex items-center justify-center gap-3"
      >
        {submitting && <LoadingSpinner size="sm" className="border-white/40 border-t-white" />}
        {submitting ? 'Enviando…' : 'Enviar solicitud'}
      </button>
    </form>
  );
}
