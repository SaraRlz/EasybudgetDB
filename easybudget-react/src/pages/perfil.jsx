import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import '../styles/perfil.css';

function Perfil() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [message, setMessage] = useState('');

  function handleSave(e) {
    e.preventDefault();

    const users = JSON.parse(localStorage.getItem('users')) || [];

    const updatedUsers = users.map((user) => {
      if (user.id === currentUser.id) {
        return {
          ...user,
          name: name.trim(),
          email: email.trim().toLowerCase(),
        };
      }

      return user;
    });

    const updatedCurrentUser = {
      ...currentUser,
      name: name.trim(),
      email: email.trim().toLowerCase(),
    };

    localStorage.setItem('users', JSON.stringify(updatedUsers));
    localStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));

    setMessage('Perfil actualizado correctamente');
  }

  function handleLogout() {
    localStorage.removeItem('currentUser');
    navigate('/login');
  }

  function handleDeleteAccount() {
    const confirmDelete = confirm('¿Seguro que quieres eliminar tu cuenta? Esta acción no se puede deshacer.');
    if (!confirmDelete) return;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const movements = JSON.parse(localStorage.getItem('movements')) || [];
    const budgets = JSON.parse(localStorage.getItem('budgets')) || [];

    localStorage.setItem('users', JSON.stringify(users.filter((user) => user.id !== currentUser.id)));

    localStorage.setItem(
      'movements',
      JSON.stringify(movements.filter((movement) => movement.userId !== currentUser.id)),
    );

    localStorage.setItem('budgets', JSON.stringify(budgets.filter((budget) => budget.userId !== currentUser.id)));

    localStorage.removeItem('currentUser');
    navigate('/login');
  }

  return (
    <Layout>
      <header className="main-header">
        <div>
          <h1>Perfil</h1>
          <p>Gestiona tus datos de usuario y preferencias básicas.</p>
        </div>
      </header>

      <section className="profile-grid">
        <article className="card profile-card">
          <div className="card-header">
            <div>
              <h2>Datos personales</h2>
              <p>Actualiza la información asociada a tu cuenta.</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="profile-form">
            <div className="form-group">
              <label htmlFor="name">Nombre</label>
              <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="form-group">
              <label htmlFor="email">Correo electrónico</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            {message && <small className="success-message">{message}</small>}

            <button type="submit" className="btn-primary">
              Guardar cambios
            </button>
          </form>
        </article>

        <article className="card profile-card">
          <div className="card-header">
            <div>
              <h2>Preferencias</h2>
              <p>Configuración visual y de uso.</p>
            </div>
          </div>

          <div className="setting-item">
            <div>
              <strong>Alertas internas</strong>
              <p>Mostrar avisos en dashboard y sección de alertas.</p>
            </div>
            <span>Activas</span>
          </div>

          <div className="setting-item">
            <div>
              <strong>Modo de análisis</strong>
              <p>Control mensual de presupuesto.</p>
            </div>
            <span>Mensual</span>
          </div>
        </article>
      </section>

      <section className="card security-card">
        <div className="card-header">
          <div>
            <h2>Seguridad y cuenta</h2>
            <p>Opciones relacionadas con la sesión y los datos almacenados.</p>
          </div>
        </div>

        <div className="security-actions">
          <button type="button" className="btn-secondary" onClick={handleLogout}>
            Cerrar sesión
          </button>

          <button type="button" className="btn-danger" onClick={handleDeleteAccount}>
            Eliminar cuenta
          </button>
        </div>
      </section>
    </Layout>
  );
}

export default Perfil;
