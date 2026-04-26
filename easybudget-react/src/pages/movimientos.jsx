import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import '../styles/movimientos.css';

function Movimientos() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  const [movements, setMovements] = useState(JSON.parse(localStorage.getItem('movements')) || []);

  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterConcept, setFilterConcept] = useState('');

  const userMovements = movements
    .filter((movement) => movement.userId === currentUser?.id)
    .filter((movement) => {
      const matchesType = filterType ? movement.type === filterType : true;
      const matchesCategory = filterCategory ? movement.category === filterCategory : true;
      const matchesConcept = filterConcept
        ? movement.concept.toLowerCase().includes(filterConcept.toLowerCase())
        : true;

      return matchesType && matchesCategory && matchesConcept;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalIncome = userMovements
    .filter((movement) => movement.type === 'income')
    .reduce((sum, movement) => sum + Number(movement.amount), 0);

  const totalExpenses = userMovements
    .filter((movement) => movement.type === 'expense')
    .reduce((sum, movement) => sum + Number(movement.amount), 0);

  const balance = totalIncome - totalExpenses;

  function deleteMovement(id) {
    const confirmDelete = confirm('¿Seguro que quieres eliminar este movimiento?');
    if (!confirmDelete) return;

    const movementToDelete = movements.find((m) => m.id === id);

    const updatedMovements = movements.filter((movement) => movement.id !== id);
    setMovements(updatedMovements);
    localStorage.setItem('movements', JSON.stringify(updatedMovements));

    if (movementToDelete?.isShoppingMovement) {
      const shoppingLists = JSON.parse(localStorage.getItem('shoppingLists')) || [];

      const updatedLists = shoppingLists.filter((list) => list.movementId !== id);

      localStorage.setItem('shoppingLists', JSON.stringify(updatedLists));
    }
  }

  return (
    <Layout>
      <header className="main-header">
        <div>
          <h1>Movimientos</h1>
          <p>Consulta, filtra y gestiona tus ingresos y gastos.</p>
        </div>

        <div className="header-actions">
          <Link to="/movimiento-form" className="btn-primary">
            + Añadir movimiento
          </Link>
        </div>
      </header>

      <section className="top-summary">
        <article className="card summary-card">
          <span>Ingresos</span>
          <h3>{totalIncome.toFixed(2)} €</h3>
          <p>Total según filtros aplicados</p>
        </article>

        <article className="card summary-card">
          <span>Gastos</span>
          <h3>{totalExpenses.toFixed(2)} €</h3>
          <p>Total según filtros aplicados</p>
        </article>

        <article className="card summary-card">
          <span>Balance</span>
          <h3>{balance.toFixed(2)} €</h3>
          <p>Diferencia entre ingresos y gastos</p>
        </article>
      </section>

      <section className="card filters-card">
        <div className="card-header">
          <div>
            <h2>Filtros</h2>
            <p>Filtra tus movimientos por tipo, categoría o concepto.</p>
          </div>
        </div>

        <div className="filters-grid">
          <div className="form-group">
            <label htmlFor="filterType">Tipo</label>
            <select id="filterType" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="">Todos</option>
              <option value="income">Ingreso</option>
              <option value="expense">Gasto</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="filterCategory">Categoría</label>
            <select id="filterCategory" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="">Todas</option>
              <option value="Vivienda">Vivienda</option>
              <option value="Comida">Comida</option>
              <option value="Compra">Compra</option>
              <option value="Transporte">Transporte</option>
              <option value="Ocio">Ocio</option>
              <option value="Salud">Salud</option>
              <option value="Otros">Otros</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="filterConcept">Concepto</label>
            <input
              type="text"
              id="filterConcept"
              placeholder="Buscar concepto..."
              value={filterConcept}
              onChange={(e) => setFilterConcept(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="card table-card">
        <div className="card-header">
          <div>
            <h2>Listado de movimientos</h2>
            <p>Movimientos registrados por el usuario.</p>
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Concepto</th>
                <th>Categoría</th>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Importe</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {userMovements.length === 0 ? (
                <tr>
                  <td colSpan="6">No hay movimientos registrados.</td>
                </tr>
              ) : (
                userMovements.map((movement) => (
                  <tr key={movement.id}>
                    <td>
                      {movement.concept}
                      {movement.isShoppingMovement && <span className="shopping-badge">Compra automática</span>}
                    </td>
                    <td>{movement.category}</td>
                    <td>{movement.date}</td>
                    <td>
                      <span className={`tag ${movement.type === 'income' ? 'tag-income' : 'tag-expense'}`}>
                        {movement.type === 'income' ? 'Ingreso' : 'Gasto'}
                      </span>
                    </td>
                    <td className={movement.type === 'income' ? 'income' : 'expense'}>
                      {movement.type === 'income' ? '+' : '-'}
                      {Number(movement.amount).toFixed(2)} €
                    </td>
                    <td>
                      {movement.isShoppingMovement ? (
                        <Link to="/compra" className="btn-edit">
                          Ver compra
                        </Link>
                      ) : (
                        <Link to={`/movimiento-form?id=${movement.id}`} className="btn-edit">
                          Editar
                        </Link>
                      )}

                      <button type="button" className="btn-delete" onClick={() => deleteMovement(movement.id)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </Layout>
  );
}

export default Movimientos;
