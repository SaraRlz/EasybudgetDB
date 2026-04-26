import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/login.css';

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordConfirmError, setPasswordConfirmError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();

    setNameError('');
    setEmailError('');
    setPasswordError('');
    setPasswordConfirmError('');

    let valid = true;

    if (!name.trim()) {
      setNameError('Introduce tu nombre');
      valid = false;
    }

    if (!email.trim()) {
      setEmailError('Introduce tu correo electrónico');
      valid = false;
    }

    if (!password.trim()) {
      setPasswordError('Introduce una contraseña');
      valid = false;
    } else if (password.trim().length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      valid = false;
    }

    if (!passwordConfirm.trim()) {
      setPasswordConfirmError('Confirma la contraseña');
      valid = false;
    } else if (password.trim() !== passwordConfirm.trim()) {
      setPasswordConfirmError('Las contraseñas no coinciden');
      valid = false;
    }

    if (!valid) return;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const emailValue = email.trim().toLowerCase();

    const existingUser = users.find((user) => user.email === emailValue);

    if (existingUser) {
      setEmailError('Ya existe una cuenta con este correo');
      return;
    }

    const newUser = {
      id: Date.now(),
      name: name.trim(),
      email: emailValue,
      password: password.trim(),
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    navigate('/login');
  }

  return (
    <main className="auth-container">
      <section className="auth-info">
        <h1>Crea tu cuenta</h1>
        <p>Regístrate para empezar a gestionar tus ingresos, gastos y presupuestos mensuales.</p>
      </section>

      <section className="auth-form">
        <div className="form-card">
          <h2>Crear cuenta</h2>
          <p>Introduce tus datos para registrarte</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="registerName">Nombre</label>
              <input
                type="text"
                id="registerName"
                placeholder="Tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={nameError ? 'input-error' : ''}
              />
              <small className="error-message">{nameError}</small>
            </div>

            <div className="form-group">
              <label htmlFor="registerEmail">Correo electrónico</label>
              <input
                type="email"
                id="registerEmail"
                placeholder="ejemplo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={emailError ? 'input-error' : ''}
              />
              <small className="error-message">{emailError}</small>
            </div>

            <div className="form-group">
              <label htmlFor="registerPassword">Contraseña</label>
              <input
                type="password"
                id="registerPassword"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={passwordError ? 'input-error' : ''}
              />
              <small className="error-message">{passwordError}</small>
            </div>

            <div className="form-group">
              <label htmlFor="registerPasswordConfirm">Confirmar contraseña</label>
              <input
                type="password"
                id="registerPasswordConfirm"
                placeholder="Repite la contraseña"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className={passwordConfirmError ? 'input-error' : ''}
              />
              <small className="error-message">{passwordConfirmError}</small>
            </div>

            <button type="submit" className="btn-primary">
              Registrarse
            </button>
          </form>

          <div className="form-footer">
            <p>¿Ya tienes cuenta?</p>
            <Link to="/login">Iniciar sesión</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Register;
