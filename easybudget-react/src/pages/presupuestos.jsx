import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import '../styles/presupuestos.css';

function Presupuestos() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  const currentMonth = new Date().toISOString().slice(0, 7);

  const [budgets, setBudgets] = useState(JSON.parse(localStorage.getItem('budgets')) || []);

  const [movements] = useState(JSON.parse(localStorage.getItem('movements')) || []);

  const [month, setMonth] = useState(currentMonth);
  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const userBudgets = budgets.filter((budget) => budget.userId === currentUser?.id && budget.month === month);

  const monthMovements = movements.filter(
    (movement) =>
      movement.userId === currentUser?.id && movement.type === 'expense' && movement.date?.startsWith(month),
  );

  function getSpentByCategory(categoryName) {
    return monthMovements
      .filter((movement) => movement.category === categoryName)
      .reduce((sum, movement) => sum + Number(movement.amount), 0);
  }

  const totalBudget = userBudgets.reduce((sum, budget) => sum + Number(budget.limit), 0);

  const totalSpent = userBudgets.reduce((sum, budget) => sum + getSpentByCategory(budget.category), 0);

  const totalRemaining = totalBudget - totalSpent;

  useEffect(() => {
    localStorage.setItem('budgets', JSON.stringify(budgets));
  }, [budgets]);

  function resetForm() {
    setCategory('');
    setLimit('');
    setEditingId(null);
    setError('');
  }

  function handleSubmit(e) {
    e.preventDefault();

    setError('');

    if (!category) {
      setError('Selecciona una categoría');
      return;
    }

    if (!limit || Number(limit) <= 0) {
      setError('Introduce un límite válido');
      return;
    }

    const duplicatedBudget = budgets.find(
      (budget) =>
        budget.userId === currentUser?.id &&
        budget.month === month &&
        budget.category === category &&
        budget.id !== editingId,
    );

    if (duplicatedBudget) {
      setError('Ya existe un presupuesto para esta categoría y mes');
      return;
    }

    if (editingId) {
      const updatedBudgets = budgets.map((budget) => {
        if (budget.id === editingId && budget.userId === currentUser?.id) {
          return {
            ...budget,
            month,
            category,
            limit: Number(limit),
          };
        }

        return budget;
      });

      setBudgets(updatedBudgets);
      resetForm();
      return;
    }

    const newBudget = {
      id: Date.now(),
      userId: currentUser.id,
      month,
      category,
      limit: Number(limit),
    };

    setBudgets([...budgets, newBudget]);
    resetForm();
  }

  function handleEdit(budget) {
    setEditingId(budget.id);
    setMonth(budget.month);
    setCategory(budget.category);
    setLimit(String(budget.limit));
    setError('');
  }

  function handleDelete(id) {
    const confirmDelete = confirm('¿Seguro que quieres eliminar este presupuesto?');
    if (!confirmDelete) return;

    const updatedBudgets = budgets.filter((budget) => budget.id !== id);
    setBudgets(updatedBudgets);

    if (editingId === id) {
      resetForm();
    }
  }

  return (
    <Layout>
      <header className="main-header">
        <div>
          <h1>Presupuestos</h1>
          <p>Define límites mensuales por categoría y compara el gasto real con la previsión.</p>
        </div>
      </header>

      <section className="top-summary">
        <article className="card summary-card">
          <span>Presupuesto total</span>
          <h3>{totalBudget.toFixed(2)} €</h3>
          <p>Límite mensual configurado</p>
        </article>

        <article className="card summary-card">
          <span>Gastado</span>
          <h3>{totalSpent.toFixed(2)} €</h3>
          <p>Consumo real acumulado</p>
        </article>

        <article className="card summary-card">
          <span>Restante</span>
          <h3>{totalRemaining.toFixed(2)} €</h3>
          <p>Disponible hasta final de mes</p>
        </article>
      </section>

      <section className="budget-grid">
        <article className="card budget-form-card">
          <div className="card-header">
            <div>
              <h2>{editingId ? 'Editar presupuesto' : 'Crear presupuesto'}</h2>
              <p>Asigna un límite económico a una categoría para el mes seleccionado.</p>
            </div>
          </div>

          <form className="budget-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="month">Mes</label>
              <input type="month" id="month" value={month} onChange={(e) => setMonth(e.target.value)} />
            </div>

            <div className="form-group">
              <label htmlFor="category">Categoría</label>
              <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Selecciona una categoría</option>
                <option value="Vivienda">Vivienda</option>
                <option value="Comida">Comida</option>
                <option value="Transporte">Transporte</option>
                <option value="Ocio">Ocio</option>
                <option value="Salud">Salud</option>
                <option value="Compra">Compra</option>
                <option value="Otros">Otros</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="limit">Límite</label>
              <input
                type="number"
                id="limit"
                step="0.01"
                placeholder="Ej. 250"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
              />
            </div>

            {error && <small className="error-message">{error}</small>}

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingId ? 'Guardar cambios' : 'Crear presupuesto'}
              </button>

              {editingId && (
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Cancelar edición
                </button>
              )}
            </div>
          </form>
        </article>

        <article className="card tracking-card">
          <div className="card-header">
            <div>
              <h2>Seguimiento por categorías</h2>
              <p>Comparativa entre presupuesto, gasto actual y desviación.</p>
            </div>
          </div>

          {userBudgets.length === 0 ? (
            <p>No hay presupuestos definidos para este mes.</p>
          ) : (
            userBudgets.map((budget) => {
              const spent = getSpentByCategory(budget.category);
              const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
              const remaining = Number(budget.limit) - spent;

              let barClass = 'primary-bar';
              if (percentage > 100) barClass = 'danger-bar';
              else if (percentage >= 80) barClass = 'warning-bar';
              else if (percentage < 50) barClass = 'success-bar';

              return (
                <div className="budget-item" key={budget.id}>
                  <div className="budget-top">
                    <strong>{budget.category}</strong>
                    <span>
                      {spent.toFixed(2)} € / {Number(budget.limit).toFixed(2)} €
                    </span>
                  </div>

                  <div className="progress">
                    <div
                      className={`progress-bar ${barClass}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>

                  <div className="budget-meta">
                    <span>Gastado: {spent.toFixed(2)} €</span>
                    <span>
                      {remaining >= 0
                        ? `Restante: ${remaining.toFixed(2)} €`
                        : `Desviación: ${Math.abs(remaining).toFixed(2)} €`}
                    </span>
                  </div>

                  <div className="budget-actions">
                    <button type="button" className="btn-edit" onClick={() => handleEdit(budget)}>
                      Editar
                    </button>

                    <button type="button" className="btn-delete" onClick={() => handleDelete(budget.id)}>
                      Eliminar
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </article>
      </section>
    </Layout>
  );
}

export default Presupuestos;
