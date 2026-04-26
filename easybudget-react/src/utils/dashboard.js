document.addEventListener('DOMContentLoaded', function () {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) return;

  const allMovements = JSON.parse(localStorage.getItem('movements')) || [];
  const userMovements = allMovements.filter((movement) => movement.userId === currentUser.id);

  const totalIncome = userMovements.filter((m) => m.type === 'income').reduce((sum, m) => sum + m.amount, 0);

  const totalExpense = userMovements.filter((m) => m.type === 'expense').reduce((sum, m) => sum + m.amount, 0);

  const balance = totalIncome - totalExpense;
  const savingRate = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(0) : 0;

  const balanceEl = document.getElementById('balanceValue');
  const incomeEl = document.getElementById('incomeValue');
  const expenseEl = document.getElementById('expenseValue');
  const savingEl = document.getElementById('savingValue');
  const movementsContainer = document.getElementById('latestMovements');

  if (balanceEl) balanceEl.textContent = `${balance.toFixed(2)} €`;
  if (incomeEl) incomeEl.textContent = `${totalIncome.toFixed(2)} €`;
  if (expenseEl) expenseEl.textContent = `${totalExpense.toFixed(2)} €`;
  if (savingEl) savingEl.textContent = `${savingRate}%`;

  if (movementsContainer) {
    movementsContainer.innerHTML = '';

    const latest = [...userMovements].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 4);

    latest.forEach((movement) => {
      const item = document.createElement('div');
      item.className = 'movement-item';

      item.innerHTML = `
        <div>
          <strong>${movement.concept}</strong>
          <span>${movement.category} · ${movement.date}</span>
        </div>
        <p class="${movement.type === 'income' ? 'income' : 'expense'}">
          ${movement.type === 'income' ? '+' : '-'}${movement.amount.toFixed(2)} €
        </p>
      `;

      movementsContainer.appendChild(item);
    });
  }
});
