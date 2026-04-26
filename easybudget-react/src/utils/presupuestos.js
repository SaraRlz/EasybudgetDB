document.addEventListener('DOMContentLoaded', function () {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) return;

  const form = document.getElementById('budgetForm');
  const container = document.getElementById('budgetsList');
  const totalBudgetValue = document.getElementById('totalBudgetValue');
  const spentBudgetValue = document.getElementById('spentBudgetValue');
  const remainingBudgetValue = document.getElementById('remainingBudgetValue');
  const deviationSummary = document.getElementById('deviationSummary');

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

  function renderSummary(budgets) {
    const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + calculateSpent(b.category), 0);
    const remaining = totalBudget - totalSpent;

    totalBudgetValue.textContent = `${totalBudget.toFixed(2)} €`;
    spentBudgetValue.textContent = `${totalSpent.toFixed(2)} €`;
    remainingBudgetValue.textContent = `${remaining.toFixed(2)} €`;
  }

  function renderDeviationSummary(budgets) {
    let withinBudget = 0;
    let warningBudget = 0;
    let overBudget = 0;

    budgets.forEach((b) => {
      const spent = calculateSpent(b.category);
      const percentage = b.limit > 0 ? (spent / b.limit) * 100 : 0;

      if (percentage < 80) withinBudget++;
      else if (percentage >= 80 && percentage <= 100) warningBudget++;
      else if (percentage > 100) overBudget++;
    });

    deviationSummary.innerHTML = `
      <div class="deviation-box positive">
        <strong>Categorías controladas</strong>
        <p>${withinBudget} categorías están por debajo del 80% del presupuesto.</p>
      </div>

      <div class="deviation-box warning">
        <strong>Categorías en riesgo</strong>
        <p>${warningBudget} categorías están entre el 80% y el 100% del límite.</p>
      </div>

      <div class="deviation-box danger">
        <strong>Categorías excedidas</strong>
        <p>${overBudget} categorías han superado el presupuesto fijado.</p>
      </div>
    `;
  }

  function deleteBudget(budgetId) {
    const budgets = JSON.parse(localStorage.getItem('budgets')) || [];
    const updatedBudgets = budgets.filter((b) => b.id !== budgetId);
    localStorage.setItem('budgets', JSON.stringify(updatedBudgets));
    renderBudgets();
  }

  function renderBudgets() {
    const budgets = getUserBudgets();
    container.innerHTML = '';

    if (budgets.length === 0) {
      container.innerHTML = '<p>No hay presupuestos configurados todavía.</p>';
      renderSummary([]);
      renderDeviationSummary([]);
      return;
    }

    budgets.forEach((b) => {
      const spent = calculateSpent(b.category);
      const rawPercentage = b.limit > 0 ? (spent / b.limit) * 100 : 0;
      const percentage = Math.min(rawPercentage, 100);

      let barClass = 'primary-bar';
      let statusText = `Restante: ${(b.limit - spent).toFixed(2)} €`;
      let statusLabel = 'Dentro del presupuesto';

      if (rawPercentage > 100) {
        barClass = 'danger-bar';
        statusText = `Desviación: +${(spent - b.limit).toFixed(2)} €`;
        statusLabel = 'Presupuesto superado';
      } else if (rawPercentage >= 80) {
        barClass = 'warning-bar';
        statusLabel = 'En riesgo';
      } else if (rawPercentage < 50) {
        barClass = 'info-bar';
      }

      const div = document.createElement('div');
      div.className = 'budget-item';

      div.innerHTML = `
        <div class="budget-top">
          <strong>${b.category}</strong>
          <span>${spent.toFixed(2)} € / ${b.limit.toFixed(2)} €</span>
        </div>

        <div class="progress">
          <div class="progress-bar ${barClass}" style="width:${percentage}%"></div>
        </div>

        <div class="budget-meta">
          <span>${rawPercentage.toFixed(0)}% usado</span>
          <span>${statusText}</span>
        </div>

       <div class="budget-status">
       <span class="budget-badge ${barClass}">${statusLabel}</span>
          <div class="budget-actions">
          <button class="btn-edit-budget" data-id="${b.id}">Editar</button>
          <button class="btn-delete-budget" data-id="${b.id}">Eliminar</button>
        </div>
      </div>
      `;

      container.appendChild(div);
    });

    const deleteButtons = document.querySelectorAll('.btn-delete-budget');
    const editButtons = document.querySelectorAll('.btn-edit-budget');

    editButtons.forEach((button) => {
      button.addEventListener('click', function () {
        const budgetId = Number(this.dataset.id);
        const budgets = JSON.parse(localStorage.getItem('budgets')) || [];
        const budgetToEdit = budgets.find((b) => b.id === budgetId);

        if (!budgetToEdit) return;

        document.getElementById('budgetCategory').value = budgetToEdit.category;
        document.getElementById('budgetLimit').value = budgetToEdit.limit;
      });
    });

    deleteButtons.forEach((button) => {
      button.addEventListener('click', function () {
        const budgetId = Number(this.dataset.id);
        const confirmDelete = confirm('¿Seguro que quieres eliminar este presupuesto?');
        if (!confirmDelete) return;
        deleteBudget(budgetId);
      });
    });

    renderSummary(budgets);
    renderDeviationSummary(budgets);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const category = document.getElementById('budgetCategory').value;
    const limit = parseFloat(document.getElementById('budgetLimit').value);

    if (!category || !limit || limit <= 0) return;

    const budgets = JSON.parse(localStorage.getItem('budgets')) || [];
    const currentMonth = getCurrentMonth();

    const existingBudgetIndex = budgets.findIndex(
      (b) => b.userId === currentUser.id && b.category === category && b.month === currentMonth,
    );

    if (existingBudgetIndex !== -1) {
      budgets[existingBudgetIndex].limit = limit;
    } else {
      budgets.push({
        id: Date.now(),
        userId: currentUser.id,
        category,
        limit,
        month: currentMonth,
      });
    }

    localStorage.setItem('budgets', JSON.stringify(budgets));
    form.reset();
    renderBudgets();
  });

  renderBudgets();
});
