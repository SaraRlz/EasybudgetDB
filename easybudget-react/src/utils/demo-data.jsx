export function initDemoData() {
  const users = JSON.parse(localStorage.getItem('users')) || [];

  if (users.length === 0) {
    localStorage.setItem(
      'users',
      JSON.stringify([
        {
          id: 1,
          name: 'Prueba',
          email: 'prueba@test.com',
          password: '123456',
        },
      ]),
    );
  }
}
