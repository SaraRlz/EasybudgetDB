document.addEventListener('DOMContentLoaded', function () {
  const currentUser = localStorage.getItem('currentUser');

  if (!currentUser) {
    window.location.href = '/login.html';
    return;
  }

  const user = JSON.parse(currentUser);
  const userNameElement = document.getElementById('userName');

  if (userNameElement) {
    userNameElement.textContent = user.name;
  }
});
