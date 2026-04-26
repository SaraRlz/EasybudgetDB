document.addEventListener('DOMContentLoaded', function () {
  const container = document.getElementById('dashboardAlerts');
  if (!container) return;

  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) return;

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

  function calculateSpentByCategory() {
    const movements = getUserMovements();
    const currentMonth = getCurrentMonth();
    const result = {};

    movements.forEach((m) => {
      if (m.type === 'expense' && m.date.startsWith(currentMonth)) {
        if (!result[m.category]) result[m.category] = 0;
        result[m.category] += m.amount;
      }
    });

    return result;
  }

  function generateAlerts() {
    const budgets = getUserBudgets();
    const spentByCategory = calculateSpentByCategory();
    const alerts = [];

    budgets.forEach((b) => {
      const spent = spentByCategory[b.category] || 0;
      const percentage = b.limit > 0 ? (spent / b.limit) * 100 : 0;

      if (percentage > 100) {
        alerts.push({
          type: 'danger',
          title: `${b.category} ha superado el presupuesto`,
          message: `Has gastado ${spent.toFixed(2)} € de ${b.limit.toFixed(2)} €`,
        });
      } else if (percentage >= 80) {
        alerts.push({
          type: 'warning',
          title: `${b.category} está cerca del límite`,
          message: `Llevas ${percentage.toFixed(0)}% del presupuesto`,
        });
      }
    });

    return alerts;
  }

  function renderAlerts() {
    const alerts = generateAlerts();
    container.innerHTML = '';

    if (alerts.length === 0) {
      container.innerHTML = `
        <div class="alert info">
          <strong>Todo bajo control</strong>
          <p>No hay alertas activas en este momento.</p>
        </div>
      `;
      return;
    }

    alerts.slice(0, 3).forEach((alert) => {
      const div = document.createElement('div');
      div.className = `alert ${alert.type}`;

      div.innerHTML = `
        <strong>${alert.title}</strong>
        <p>${alert.message}</p>
      `;

      container.appendChild(div);
    });
  }

  renderAlerts();
});
