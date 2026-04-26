export function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function generateBudgetAlerts(currentUser) {
  if (!currentUser) return [];

  const movements = JSON.parse(localStorage.getItem('movements')) || [];
  const budgets = JSON.parse(localStorage.getItem('budgets')) || [];
  const currentMonth = getCurrentMonth();

  const userMovements = movements.filter(
    (m) => m.userId === currentUser.id && m.type === 'expense' && m.date?.startsWith(currentMonth),
  );

  const userBudgets = budgets.filter((b) => b.userId === currentUser.id && b.month === currentMonth);

  function getSpentByCategory(category) {
    return userMovements.filter((m) => m.category === category).reduce((sum, m) => sum + Number(m.amount), 0);
  }

  const alerts = [];

  userBudgets.forEach((budget) => {
    const spent = getSpentByCategory(budget.category);
    const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;

    if (percentage > 100) {
      alerts.push({
        type: 'danger',
        title: `${budget.category} ha superado el presupuesto`,
        message: `Has gastado ${spent.toFixed(2)} € de ${Number(budget.limit).toFixed(2)} €`,
      });
    } else if (percentage >= 80) {
      alerts.push({
        type: 'warning',
        title: `${budget.category} está cerca del límite`,
        message: `Llevas ${percentage.toFixed(0)}% del presupuesto`,
      });
    }
  });

  return alerts;
}
