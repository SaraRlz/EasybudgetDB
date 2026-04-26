import { NavLink, useNavigate } from 'react-router-dom';

function Sidebar() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem('currentUser');
    navigate('/login');
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>EasyBudget</h2>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/movimientos">Movimientos</NavLink>
        <NavLink to="/movimiento-form">Añadir movimiento</NavLink>
        <NavLink to="/presupuestos">Presupuestos</NavLink>
        <NavLink to="/compra">Compra</NavLink>
        <NavLink to="/planificador">Planificador</NavLink>
        <NavLink to="/alertas">Alertas</NavLink>
        <NavLink to="/perfil">Perfil</NavLink>
        <button type="button" onClick={handleLogout} className="sidebar-logout">
          Cerrar sesión
        </button>
      </nav>
    </aside>
  );
}

export default Sidebar;
