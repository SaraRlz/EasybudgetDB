import { useState } from 'react';
import Layout from '../components/Layout';
import '../styles/planificador.css';

const categories = ['Vivienda', 'Comida', 'Transporte', 'Ocio', 'Salud', 'Seguros', 'Mantenimiento', 'Otros'];

function Planificador() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  const [plannedExpenses, setPlannedExpenses] = useState(JSON.parse(localStorage.getItem('plannedExpenses')) || []);

  const [concept, setConcept] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [notes, setNotes] = useState('');

  const userPlannedExpenses = plannedExpenses
    .filter((item) => item.userId === currentUser?.id)
    .sort((a, b) => a.month.localeCompare(b.month));

  const totalPlanned = userPlannedExpenses.reduce((sum, item) => sum + Number(item.amount), 0);

  function savePlannedExpenses(updatedExpenses) {
    setPlannedExpenses(updatedExpenses);
    localStorage.setItem('plannedExpenses', JSON.stringify(updatedExpenses));
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!concept.trim() || !category || !amount || Number(amount) <= 0 || !month) {
      alert('Completa todos los campos obligatorios');
      return;
    }

    const newPlannedExpense = {
      id: crypto.randomUUID(),
      userId: currentUser.id,
      concept: concept.trim(),
      category,
      amount: Number(amount),
      month,
      notes: notes.trim(),
      status: 'planned',
    };

    savePlannedExpenses([...plannedExpenses, newPlannedExpense]);

    setConcept('');
    setCategory('');
    setAmount('');
    setNotes('');
  }

  function handleDelete(id) {
    const confirmDelete = confirm('¿Seguro que quieres eliminar este gasto planificado?');
    if (!confirmDelete) return;

    const updatedExpenses = plannedExpenses.filter((item) => item.id !== id);
    savePlannedExpenses(updatedExpenses);
  }

  return (
    <Layout>
      <header className="main-header">
        <div>
          <h1>Planificador de gastos</h1>
          <p>Organiza posibles gastos futuros sin registrarlos como movimientos reales.</p>
        </div>
      </header>

      <section className="planner-summary">
        <article className="card summary-card">
          <span>Gastos planificados</span>
          <h3>{userPlannedExpenses.length}</h3>
          <p>Borradores registrados</p>
        </article>

        <article className="card summary-card">
          <span>Total previsto</span>
          <h3>{totalPlanned.toFixed(2)} €</h3>
          <p>No afecta al saldo real</p>
        </article>
      </section>

      <section className="planner-grid">
        <article className="card planner-form-card">
          <div className="card-header">
            <div>
              <h2>Nuevo gasto previsto</h2>
              <p>Añade una previsión para próximos meses.</p>
            </div>
          </div>

          <form className="planner-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="concept">Concepto</label>
              <input
                id="concept"
                type="text"
                placeholder="Ej. seguro del coche"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Categoría</label>
              <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Selecciona una categoría</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="amount">Importe estimado</label>
              <input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="month">Mes previsto</label>
              <input id="month" type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notas</label>
              <textarea
                id="notes"
                placeholder="Detalles opcionales..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary">
              Guardar previsión
            </button>
          </form>
        </article>

        <article className="card planner-list-card">
          <div className="card-header">
            <div>
              <h2>Gastos previstos</h2>
              <p>Listado de borradores planificados.</p>
            </div>
          </div>

          {userPlannedExpenses.length === 0 ? (
            <p>No hay gastos planificados todavía.</p>
          ) : (
            <div className="planned-list">
              {userPlannedExpenses.map((item) => (
                <div className="planned-item" key={item.id}>
                  <div>
                    <strong>{item.concept}</strong>
                    <span>
                      {item.category} · {item.month}
                    </span>
                    {item.notes && <p>{item.notes}</p>}
                  </div>

                  <div className="planned-actions">
                    <strong>{Number(item.amount).toFixed(2)} €</strong>
                    <button type="button" className="btn-delete" onClick={() => handleDelete(item.id)}>
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
    </Layout>
  );
}

export default Planificador;
