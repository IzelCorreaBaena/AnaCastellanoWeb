import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@services/auth.api';
import { useAuthStore } from '@hooks/useAuth';

export default function AdminLogin() {
  const navigate = useNavigate();
  const setToken = useAuthStore((s) => s.setToken);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token } = await authApi.login(email, password);
      setToken(token);
      navigate('/admin/dashboard');
    } catch {
      setError('Credenciales inválidas. Comprueba tu email y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl text-charcoal-800">Ana Castellano</h1>
          <p className="text-gold-500 font-sans text-xs uppercase tracking-widest mt-1">Panel de Administración</p>
          <div className="divider-gold mx-auto mt-4" style={{ width: 40 }} />
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-sm shadow-sm border border-ivory-200 p-8 space-y-5">
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="form-label">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                className="input-field"
                placeholder="admin@anacastellano.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="form-label">Contraseña</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <p className="form-error text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Accediendo...' : 'Acceder'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-charcoal-400 font-sans mt-6">
          Acceso restringido · Ana Castellano Florista
        </p>
      </div>
    </div>
  );
}
