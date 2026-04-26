import Layout from '../components/Layout';
import '../styles/alertas.css';

function Alertas() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const movements = JSON.parse(localStorage.getItem('movements')) || [];
  const budgets = JSON.parse(localStorage.getItem('budgets')) || [];

  const currentMonth = new Date().toISOString().slice(0, 7);

  const userMovements = movements.filter((m) => m.userId === currentUser?.id);
  const monthMovements = userMovements.filter((m) => m.type === 'expense' && m.date?.startsWith(currentMonth));

  const userBudgets = budgets.filter((b) => b.userId === currentUser?.id && b.month === currentMonth);

  function getSpentByCategory(category) {
    return monthMovements.filter((m) => m.category === category).reduce((sum, m) => sum + Number(m.amount), 0);
  }

  const alerts = userBudgets
    .map((budget) => {
      const spent = getSpentByCategory(budget.category);
      const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;

      if (percentage > 100) {
        return {
          type: 'danger',
          level: 'Nivel alto',
          title: `${budget.category} ha superado el presupuesto`,
          message: `Has gastado ${spent.toFixed(2)} € de ${Number(budget.limit).toFixed(2)} €. Se recomienda reducir nuevos gastos en esta categoría.`,
        };
      }

      if (percentage >= 80) {
        return {
          type: 'warning',
          level: 'Nivel medio',
          title: `${budget.category} está cerca del límite`,
          message: `Has consumido el ${percentage.toFixed(0)}% del presupuesto mensual. Conviene controlar los próximos gastos.`,
        };
      }

      return null;
    })
    .filter(Boolean);

  const totalBudget = userBudgets.reduce((sum, b) => sum + Number(b.limit), 0);
  const totalSpent = userBudgets.reduce((sum, b) => sum + getSpentByCategory(b.category), 0);

  const riskLevel =
    totalBudget === 0
      ? 'Sin datos'
      : totalSpent / totalBudget > 1
        ? 'Alto'
        : totalSpent / totalBudget >= 0.8
          ? 'Medio'
          : 'Bajo';

  const generalStatus = alerts.some((a) => a.type === 'danger')
    ? 'Revisar'
    : alerts.length > 0
      ? 'Atención'
      : 'Estable';

  const recommendations = alerts.length
    ? alerts.map((alert) => ({
        title: alert.type === 'danger' ? 'Reducir gasto' : 'Controlar próximos gastos',
        message: alert.message,
      }))
    : [
        {
          title: 'Mantener comportamiento actual',
          message: 'No hay desviaciones activas. El gasto se mantiene dentro de los límites definidos.',
        },
      ];

  return (
    <Layout>
      <header className="main-header">
        <div>
          <h1>Alertas y recomendaciones</h1>
          <p>Feedback interno basado en tus presupuestos y gastos del mes actual.</p>
        </div>
      </header>

      <section className="alerts-summary">
        <article className="card summary">
          <span>Alertas activas</span>
          <h3>{alerts.length}</h3>
        </article>

        <article className="card summary">
          <span>Riesgo de gasto</span>
          <h3>{riskLevel}</h3>
        </article>

        <article className="card summary">
          <span>Estado general</span>
          <h3>{generalStatus}</h3>
        </article>
      </section>

      <section className="alerts-list">
        {alerts.length === 0 ? (
          <article className="alert-card info">
            <h3>Todo bajo control</h3>
            <p>No hay alertas activas. Tus gastos se mantienen dentro de los presupuestos definidos.</p>
            <span className="tag">Información</span>
          </article>
        ) : (
          alerts.map((alert, index) => (
            <article className={`alert-card ${alert.type}`} key={index}>
              <h3>{alert.title}</h3>
              <p>{alert.message}</p>
              <span className="tag">{alert.level}</span>
            </article>
          ))
        )}
      </section>

      <section className="card recommendations">
        <div className="card-header">
          <div>
            <h2>Recomendaciones personalizadas</h2>
            <p>Sugerencias generadas automáticamente a partir de tus datos.</p>
          </div>
        </div>

        {recommendations.map((recommendation, index) => (
          <div className="recommendation-item" key={index}>
            <strong>{recommendation.title}</strong>
            <p>{recommendation.message}</p>
          </div>
        ))}
      </section>
    </Layout>
  );
}

export default Alertas;
