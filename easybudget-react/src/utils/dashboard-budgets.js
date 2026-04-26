document.addEventListener('DOMContentLoaded', function () {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) return;

  const container = document.getElementById('dashboardBudgets');
  if (!container) return;

  function getCurrentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  function getUserBudgets() {
    const budgets = JSON.parse(localStorage.getItem('budgets')) || [];
    return budgets.filter((b) => b.userId === currentUser.id && b.month === getCurrentMonth());
  }

  function getUserMovements() {
    const movements = JSON.parse(localStorage.getItem('movements')) || [];
    return movements.filter((m) => m.userId === currentUser.id);
  }

  function calculateSpent(category) {
    const movements = getUserMovements();
    const currentMonth = getCurrentMonth();

    return movements
      .filter((m) => m.type === 'expense' && m.category === category && m.date.startsWith(currentMonth))
      .reduce((sum, m) => sum + m.amount, 0);
  }

  function renderBudgets() {
    const budgets = getUserBudgets();
    container.innerHTML = '';

    if (budgets.length === 0) {
      container.innerHTML = '<p>No hay presupuestos definidos este mes.</p>';
      return;
    }

    budgets.slice(0, 3).forEach((b) => {
      const spent = calculateSpent(b.category);
      const rawPercentage = b.limit > 0 ? (spent / b.limit) * 100 : 0;
      const percentage = Math.min(rawPercentage, 100);

      let barClass = 'primary-bar';
      if (rawPercentage > 100) barClass = 'danger-bar';
      else if (rawPercentage >= 80) barClass = 'warning-bar';

      const item = document.createElement('div');
      item.className = 'budget-item';

      item.innerHTML = `
        <div class="budget-top">
          <strong>${b.category}</strong>
          <span>${spent.toFixed(2)} / ${b.limit.toFixed(2)} €</span>
        </div>
        <div class="progress">
          <div class="progress-bar ${barClass}" style="width: ${percentage}%"></div>
        </div>
      `;

      container.appendChild(item);
    });
  }

  renderBudgets();
});
