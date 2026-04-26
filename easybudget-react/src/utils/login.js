document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;

    const users = JSON.parse(localStorage.getItem('users')) || [];

    const userFound = users.find((user) => user.email === email && user.password === password);

    if (!userFound) {
      alert('Correo o contraseña incorrectos');
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

    console.log('LOGIN OK');
    console.log('Redirigiendo a:', window.location.origin + '/dashboard.html');

    window.location.assign('dashboard.html');
  });
});
