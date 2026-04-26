document.addEventListener('DOMContentLoaded', function () {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) return;

  function getCurrentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  function getUserMovements() {
    const movements = JSON.parse(localStorage.getItem('movements')) || [];
    return movements.filter((m) => m.userId === currentUser.id);
  }

  function calculateExpensesByCategory() {
    const movements = getUserMovements();
    const currentMonth = getCurrentMonth();

    const totals = {
      Vivienda: 0,
      Comida: 0,
      Transporte: 0,
      Ocio: 0,
      Otros: 0,
    };

    movements.forEach((m) => {
      if (m.type === 'expense' && m.date.startsWith(currentMonth)) {
        if (totals.hasOwnProperty(m.category)) {
          totals[m.category] += m.amount;
        } else {
          totals['Otros'] += m.amount;
        }
      }
    });

    return totals;
  }

  function renderChart() {
    const totals = calculateExpensesByCategory();
    const values = Object.values(totals);
    const maxValue = Math.max(...values, 1);

    const heights = {
      Vivienda: (totals.Vivienda / maxValue) * 100,
      Comida: (totals.Comida / maxValue) * 100,
      Transporte: (totals.Transporte / maxValue) * 100,
      Ocio: (totals.Ocio / maxValue) * 100,
      Otros: (totals.Otros / maxValue) * 100,
    };

    const barVivienda = document.getElementById('barVivienda');
    const barComida = document.getElementById('barComida');
    const barTransporte = document.getElementById('barTransporte');
    const barOcio = document.getElementById('barOcio');
    const barOtros = document.getElementById('barOtros');

    if (barVivienda) barVivienda.style.height = `${heights.Vivienda}%`;
    if (barComida) barComida.style.height = `${heights.Comida}%`;
    if (barTransporte) barTransporte.style.height = `${heights.Transporte}%`;
    if (barOcio) barOcio.style.height = `${heights.Ocio}%`;
    if (barOtros) barOtros.style.height = `${heights.Otros}%`;
  }

  renderChart();
});
