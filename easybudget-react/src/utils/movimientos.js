document.addEventListener('DOMContentLoaded', function () {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) return;

  const table = document.getElementById('movementsTable');
  const filterType = document.getElementById('filterType');
  const filterCategory = document.getElementById('filterCategory');
  const filterConcept = document.getElementById('filterConcept');

  function getFilteredMovements() {
    const allMovements = JSON.parse(localStorage.getItem('movements')) || [];

    let userMovements = allMovements
      .filter((m) => m.userId === currentUser.id)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (filterType.value) {
      userMovements = userMovements.filter((m) => m.type === filterType.value);
    }

    if (filterCategory.value) {
      userMovements = userMovements.filter((m) => m.category === filterCategory.value);
    }

    if (filterConcept.value.trim()) {
      const search = filterConcept.value.trim().toLowerCase();
      userMovements = userMovements.filter((m) => m.concept.toLowerCase().includes(search));
    }

    return userMovements;
  }

  function renderMovements() {
    const userMovements = getFilteredMovements();
    table.innerHTML = '';

    if (userMovements.length === 0) {
      table.innerHTML = `
        <tr>
          <td colspan="6">No hay movimientos que coincidan con los filtros</td>
        </tr>
      `;
      return;
    }

    userMovements.forEach((m) => {
      const row = document.createElement('tr');

      row.innerHTML = `
        <td>${m.concept}</td>
        <td>${m.category}</td>
        <td>${m.date}</td>
        <td>
          <span class="tag ${m.type === 'income' ? 'tag-income' : 'tag-expense'}">
            ${m.type === 'income' ? 'Ingreso' : 'Gasto'}
          </span>
        </td>
        <td class="${m.type === 'income' ? 'income' : 'expense'}">
          ${m.type === 'income' ? '+' : '-'}${m.amount.toFixed(2)} €
        </td>
        <td>
          <a href="movimiento-form.html?id=${m.id}" class="btn-edit">Editar</a>
          <button class="btn-delete" data-id="${m.id}">Eliminar</button>
        </td>
      `;

      table.appendChild(row);
    });

    const deleteButtons = document.querySelectorAll('.btn-delete');

    deleteButtons.forEach((button) => {
      button.addEventListener('click', function () {
        const movementId = Number(this.dataset.id);
        const confirmDelete = confirm('¿Seguro que quieres eliminar este movimiento?');
        if (!confirmDelete) return;

        const allMovements = JSON.parse(localStorage.getItem('movements')) || [];
        const updatedMovements = allMovements.filter((m) => m.id !== movementId);

        localStorage.setItem('movements', JSON.stringify(updatedMovements));
        renderMovements();
      });
    });
  }

  filterType.addEventListener('change', renderMovements);
  filterCategory.addEventListener('change', renderMovements);
  filterConcept.addEventListener('input', renderMovements);

  renderMovements();
});
