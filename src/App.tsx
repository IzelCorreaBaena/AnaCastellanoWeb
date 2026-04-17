import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '@pages/Home';
import About from '@pages/About';
import Services from '@pages/Services';
import Contact from '@pages/Contact';
import Reservations from '@pages/Reservations';
import AdminLogin from '@pages/Admin/Login';
import AdminDashboard from '@pages/Admin/Dashboard';
import AdminServices from '@pages/Admin/Services';
import AdminReservations from '@pages/Admin/Reservations';
import AdminPresupuestos from '@pages/Admin/Presupuestos';
import PublicLayout from '@components/layouts/PublicLayout';
import AdminLayout from '@components/layouts/AdminLayout';
import ProtectedRoute from '@components/ProtectedRoute';

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/reservations" element={<Reservations />} />
      </Route>

      {/* Admin auth */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Protected admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="services" element={<AdminServices />} />
        <Route path="reservations" element={<AdminReservations />} />
        <Route path="presupuestos" element={<AdminPresupuestos />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
