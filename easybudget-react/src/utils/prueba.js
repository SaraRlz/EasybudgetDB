export function initDemoData() {
  const users = JSON.parse(localStorage.getItem('users')) || [];

  const demoExists = users.some((user) => user.email === 'prueba@test.com');

  if (!demoExists) {
    users.push({
      id: 1,
      name: 'Prueba',
      email: 'prueba@test.com',
      password: '123456',
    });

    localStorage.setItem('users', JSON.stringify(users));
  }
}
