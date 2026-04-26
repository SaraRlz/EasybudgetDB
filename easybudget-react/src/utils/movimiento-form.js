document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('movementForm');

  const type = document.getElementById('type');
  const concept = document.getElementById('concept');
  const category = document.getElementById('category');
  const amount = document.getElementById('amount');
  const date = document.getElementById('date');

  const typeError = document.getElementById('typeError');
  const conceptError = document.getElementById('conceptError');
  const categoryError = document.getElementById('categoryError');
  const amountError = document.getElementById('amountError');
  const dateError = document.getElementById('dateError');

  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!form || !currentUser) return;

  const params = new URLSearchParams(window.location.search);
  const movementId = params.get('id');

  let movements = JSON.parse(localStorage.getItem('movements')) || [];
  let editingMovement = null;

  if (movementId) {
    editingMovement = movements.find((m) => m.id === Number(movementId) && m.userId === currentUser.id);

    if (editingMovement) {
      type.value = editingMovement.type;
      concept.value = editingMovement.concept;
      category.value = editingMovement.category;
      amount.value = editingMovement.amount;
      date.value = editingMovement.date;

      const title = document.querySelector('.main-header h1');
      if (title) title.textContent = 'Editar movimiento';

      const button = form.querySelector('button[type="submit"]');
      if (button) button.textContent = 'Guardar cambios';
    }
  }

  function clearErrors() {
    typeError.textContent = '';
    conceptError.textContent = '';
    categoryError.textContent = '';
    amountError.textContent = '';
    dateError.textContent = '';

    type.classList.remove('input-error');
    concept.classList.remove('input-error');
    category.classList.remove('input-error');
    amount.classList.remove('input-error');
    date.classList.remove('input-error');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearErrors();

    let valid = true;

    if (!type.value) {
      typeError.textContent = 'Selecciona un tipo';
      type.classList.add('input-error');
      valid = false;
    }

    if (!concept.value.trim()) {
      conceptError.textContent = 'Introduce un concepto';
      concept.classList.add('input-error');
      valid = false;
    }

    if (!category.value) {
      categoryError.textContent = 'Selecciona una categoría';
      category.classList.add('input-error');
      valid = false;
    }

    if (!amount.value || Number(amount.value) <= 0) {
      amountError.textContent = 'Introduce un importe válido';
      amount.classList.add('input-error');
      valid = false;
    }

    if (!date.value) {
      dateError.textContent = 'Selecciona una fecha';
      date.classList.add('input-error');
      valid = false;
    }

    if (!valid) return;

    if (editingMovement) {
      movements = movements.map((m) => {
        if (m.id === editingMovement.id) {
          return {
            ...m,
            type: type.value,
            concept: concept.value.trim(),
            category: category.value,
            amount: Number(amount.value),
            date: date.value,
          };
        }
        return m;
      });
    } else {
      const newMovement = {
        id: Date.now(),
        userId: currentUser.id,
        type: type.value,
        concept: concept.value.trim(),
        category: category.value,
        amount: Number(amount.value),
        date: date.value,
      };

      movements.push(newMovement);
    }

    localStorage.setItem('movements', JSON.stringify(movements));
    window.location.href = '/movimientos.html';
  });

  [type, concept, category, amount, date].forEach((field) => {
    field.addEventListener('input', clearErrors);
    field.addEventListener('change', clearErrors);
  });
});
