import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

import Alertas from './pages/alertas';
import Compra from './pages/compra';
import Dashboard from './pages/dashboard';
import Login from './pages/login';
import MovimientoForm from './pages/movimiento-form';
import Movimientos from './pages/movimientos';
import Perfil from './pages/perfil';
import Planificador from './pages/planificador';
import Presupuestos from './pages/presupuestos';
import Register from './pages/register';
function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/movimiento-form"
        element={
          <ProtectedRoute>
            <MovimientoForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/movimientos"
        element={
          <ProtectedRoute>
            <Movimientos />
          </ProtectedRoute>
        }
      />

      <Route
        path="/presupuestos"
        element={
          <ProtectedRoute>
            <Presupuestos />
          </ProtectedRoute>
        }
      />

      <Route
        path="/compra"
        element={
          <ProtectedRoute>
            <Compra />
          </ProtectedRoute>
        }
      />

      <Route
        path="/planificador"
        element={
          <ProtectedRoute>
            <Planificador />
          </ProtectedRoute>
        }
      />

      <Route
        path="/alertas"
        element={
          <ProtectedRoute>
            <Alertas />
          </ProtectedRoute>
        }
      />

      <Route
        path="/perfil"
        element={
          <ProtectedRoute>
            <Perfil />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
