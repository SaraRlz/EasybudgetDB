import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/login.css';

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();

    setEmailError('');
    setPasswordError('');

    let valid = true;

    if (!email.trim()) {
      setEmailError('Introduce tu correo electrónico');
      valid = false;
    }

    if (!password.trim()) {
      setPasswordError('Introduce tu contraseña');
      valid = false;
    }

    if (!valid) return;

    const emailValue = email.trim().toLowerCase();
    const passwordValue = password.trim();

    const users = JSON.parse(localStorage.getItem('users')) || [];

    const userFound = users.find(
      (user) => user.email?.trim().toLowerCase() === emailValue && user.password?.trim() === passwordValue,
    );
    if (!userFound) {
      setPasswordError('Correo o contraseña incorrectos');
      return;
    }

    localStorage.setItem(
      'currentUser',
      JSON.stringify({
        id: userFound.id,
        name: userFound.name,
        email: userFound.email,
      }),
    );

    navigate('/dashboard');
  }

  return (
    <main className="auth-container">
      <section className="auth-info">
        <h1>Gestiona tus finanzas de forma inteligente</h1>
        <p>Controla tus gastos, define presupuestos y recibe recomendaciones para mejorar tu situación financiera.</p>
      </section>

      <section className="auth-form">
        <div className="form-card">
          <h2>Iniciar sesión</h2>
          <p>Accede a tu cuenta para continuar</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="email">Correo electrónico</label>
              <input
                type="email"
                id="email"
                placeholder="ejemplo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={emailError ? 'input-error' : ''}
              />
              <small className="error-message">{emailError}</small>
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={passwordError ? 'input-error' : ''}
              />
              <small className="error-message">{passwordError}</small>
            </div>

            <button type="submit" className="btn-primary">
              Entrar
            </button>
          </form>

          <div className="form-footer">
            <p>¿No tienes cuenta?</p>
            <Link to="/register">Crear cuenta</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Login;
