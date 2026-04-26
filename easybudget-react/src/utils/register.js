document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('registerForm');
  console.log('register.js cargado');

  if (!form) {
    console.log('No se encontró registerForm');
    return;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    console.log('submit register detectado');

    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim().toLowerCase();
    const password = document.getElementById('registerPassword').value;

    const users = JSON.parse(localStorage.getItem('users')) || [];

    const newUser = {
      id: Date.now(),
      name,
      email,
      password,
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    console.log('Usuarios después de guardar:', JSON.parse(localStorage.getItem('users')));

    window.location.href = './login.html';
  });
});
