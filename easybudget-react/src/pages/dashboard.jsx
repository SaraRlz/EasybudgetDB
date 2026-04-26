import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import Layout from '../components/Layout';
import '../styles/dashboard.css';

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
);

function Dashboard() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  const movements = JSON.parse(localStorage.getItem('movements')) || [];
  const budgets = JSON.parse(localStorage.getItem('budgets')) || [];

  const currentMonth = new Date().toISOString().slice(0, 7);

  const userMovements = movements.filter((m) => m.userId === currentUser?.id);
  const monthMovements = userMovements.filter((m) => m.date?.startsWith(currentMonth));

  const income = monthMovements.filter((m) => m.type === 'income').reduce((sum, m) => sum + Number(m.amount), 0);

  const expenses = monthMovements.filter((m) => m.type === 'expense').reduce((sum, m) => sum + Number(m.amount), 0);

  const balance = income - expenses;
  const savingRate = income > 0 ? Math.round((balance / income) * 100) : 0;

  const totalIncome = userMovements.filter((m) => m.type === 'income').reduce((sum, m) => sum + Number(m.amount), 0);

  const totalExpenses = userMovements.filter((m) => m.type === 'expense').reduce((sum, m) => sum + Number(m.amount), 0);

  const totalBalance = totalIncome - totalExpenses;

  const userBudgets = budgets.filter((b) => b.userId === currentUser?.id && b.month === currentMonth);

  function getSpentByCategory(category) {
    return monthMovements
      .filter((m) => m.type === 'expense' && m.category === category)
      .reduce((sum, m) => sum + Number(m.amount), 0);
  }

  const alerts = userBudgets
    .map((budget) => {
      const spent = getSpentByCategory(budget.category);
      const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;

      if (percentage > 100) {
        return {
          type: 'danger',
          title: `${budget.category} ha superado el presupuesto`,
          message: `Has gastado ${spent.toFixed(2)} € de ${Number(budget.limit).toFixed(2)} €`,
        };
      }

      if (percentage >= 80) {
        return {
          type: 'warning',
          title: `${budget.category} está cerca del límite`,
          message: `Llevas ${percentage.toFixed(0)}% del presupuesto`,
        };
      }

      return null;
    })
    .filter(Boolean);

  const categories = ['Vivienda', 'Comida', 'Transporte', 'Ocio', 'Salud', 'Compra', 'Otros'];

  const categoryTotals = categories.map((category) => ({
    category,
    total: getSpentByCategory(category),
  }));

  const filteredCategoryTotals = categoryTotals.filter((item) => item.total > 0);

  const latestMovements = [...userMovements].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 4);
  function buildMonthlyExpenseForecast() {
    const expensesByMonth = {};

    userMovements
      .filter((movement) => movement.type === 'expense')
      .forEach((movement) => {
        const monthKey = movement.date?.slice(0, 7);

        if (!monthKey) return;

        if (!expensesByMonth[monthKey]) {
          expensesByMonth[monthKey] = 0;
        }

        expensesByMonth[monthKey] += Number(movement.amount);
      });

    const monthlyValues = Object.entries(expensesByMonth)
      .sort(([monthA], [monthB]) => monthA.localeCompare(monthB))
      .map(([month, total]) => ({
        month,
        total,
      }));

    if (monthlyValues.length === 0) {
      return {
        forecast: 0,
        monthsUsed: 0,
        trend: 'Sin datos suficientes',
      };
    }

    const lastThreeMonths = monthlyValues.slice(-3);

    const forecast = lastThreeMonths.reduce((sum, item) => sum + item.total, 0) / lastThreeMonths.length;

    const lastMonth = lastThreeMonths[lastThreeMonths.length - 1]?.total || 0;

    let trend = 'Estable';

    if (forecast > lastMonth * 1.1) {
      trend = 'Posible aumento del gasto';
    } else if (forecast < lastMonth * 0.9) {
      trend = 'Posible reducción del gasto';
    }

    return {
      forecast,
      monthsUsed: lastThreeMonths.length,
      trend,
    };
  }

  const nextMonthForecast = buildMonthlyExpenseForecast();
  function buildBalanceTimeline() {
    const sortedMovements = [...userMovements].sort((a, b) => new Date(a.date) - new Date(b.date));

    let accumulatedBalance = 0;

    const labels = [];
    const data = [];

    sortedMovements.forEach((movement) => {
      if (movement.type === 'income') {
        accumulatedBalance += Number(movement.amount);
      } else {
        accumulatedBalance -= Number(movement.amount);
      }

      labels.push(movement.date);
      data.push(accumulatedBalance);
    });

    return { labels, data };
  }

  const timeline = buildBalanceTimeline();

  const doughnutData = {
    labels: filteredCategoryTotals.length > 0 ? filteredCategoryTotals.map((item) => item.category) : ['Sin gastos'],
    datasets: [
      {
        data: filteredCategoryTotals.length > 0 ? filteredCategoryTotals.map((item) => item.total) : [1],
        backgroundColor: ['#4f46e5', '#16a34a', '#0ea5e9', '#dc2626', '#d97706', '#6b7280'],
        borderWidth: 0,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label(context) {
            const value = Number(context.raw);
            return `${context.label}: ${value.toFixed(2)} €`;
          },
        },
      },
    },
  };

  const lineData = {
    labels: timeline.labels.length > 0 ? timeline.labels : ['Sin datos'],
    datasets: [
      {
        label: 'Saldo acumulado',
        data: timeline.data.length > 0 ? timeline.data : [0],
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.12)',
        fill: true,
        tension: 0.35,
        pointRadius: 4,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label(context) {
            return `Saldo: ${Number(context.raw).toFixed(2)} €`;
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback(value) {
            return `${value} €`;
          },
        },
      },
    },
  };

  function getFinancialStatus() {
    if (savingRate >= 20) return { text: 'Excelente', className: 'status-good' };
    if (savingRate >= 10) return { text: 'Buena', className: 'status-warning' };
    if (savingRate >= 0) return { text: 'Mejorable', className: 'status-danger' };
    return { text: 'En riesgo', className: 'status-danger' };
  }

  const financialStatus = getFinancialStatus();

  return (
    <>
      <Layout>
        <header className="main-header">
          <div>
            <h1>
              Hola, <span>{currentUser?.name}</span> 👋
            </h1>
            <p>Este es el resumen de tu situación financiera actual.</p>
          </div>

          <div className="header-actions">
            <button className="btn-secondary">Exportar</button>
            <a href="/movimiento-form" className="btn-primary">
              + Añadir movimiento
            </a>
          </div>
        </header>

        <section className="summary-cards">
          <article className="card summary-card">
            <span>Saldo total</span>
            <h3>{totalBalance.toFixed(2)} €</h3>
            <p>Balance acumulado de todos los meses</p>
          </article>

          <article className="card summary-card">
            <span>Ingresos del mes</span>
            <h3>{income.toFixed(2)} €</h3>
            <p>Total registrado este mes</p>
          </article>

          <article className="card summary-card">
            <span>Gastos del mes</span>
            <h3>{expenses.toFixed(2)} €</h3>
            <p>Total registrado este mes</p>
          </article>

          <article className="card summary-card">
            <span>Salud financiera</span>
            <h3 className={financialStatus.className}>{financialStatus.text}</h3>
            <p>Ahorro mensual estimado: {savingRate}%</p>
          </article>
        </section>

        <section className="forecast-section">
          <article className="card summary-card">
            <span>Previsión próximo mes</span>
            <h3>{nextMonthForecast.forecast.toFixed(2)} €</h3>
            <p>
              {nextMonthForecast.monthsUsed === 0
                ? 'Aún no hay datos suficientes para calcular la previsión'
                : `Basado en ${nextMonthForecast.monthsUsed} mes${
                    nextMonthForecast.monthsUsed === 1 ? '' : 'es'
                  } anterior${nextMonthForecast.monthsUsed === 1 ? '' : 'es'} · ${nextMonthForecast.trend}`}
            </p>
          </article>
        </section>

        <section className="charts-grid">
          <article className="card chart-card">
            <div className="card-header">
              <div>
                <h2>Gastos por categoría</h2>
                <p>Distribución mensual real mediante Chart.js</p>
              </div>
              <span className="tag">Mes actual</span>
            </div>

            <div className="chart-container">
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
          </article>

          <article className="card alerts-card">
            <div className="card-header">
              <div>
                <h2>Alertas</h2>
                <p>Recomendaciones activas</p>
              </div>
            </div>

            {alerts.length === 0 ? (
              <div className="alert info">
                <strong>Todo bajo control</strong>
                <p>No hay alertas activas en este momento.</p>
              </div>
            ) : (
              alerts.slice(0, 3).map((alert, index) => (
                <div key={index} className={`alert ${alert.type}`}>
                  <strong>{alert.title}</strong>
                  <p>{alert.message}</p>
                </div>
              ))
            )}
          </article>
        </section>

        <section className="card chart-card line-chart-card">
          <div className="card-header">
            <div>
              <h2>Evolución del saldo</h2>
              <p>Progreso acumulado según los movimientos registrados.</p>
            </div>
          </div>

          <div className="line-chart-container">
            <Line data={lineData} options={lineOptions} />
          </div>
        </section>

        <section className="bottom-grid">
          <article className="card movements-card">
            <div className="card-header">
              <div>
                <h2>Últimos movimientos</h2>
                <p>Resumen de actividad reciente</p>
              </div>
            </div>

            {latestMovements.length === 0 ? (
              <p>No hay movimientos registrados.</p>
            ) : (
              latestMovements.map((movement) => (
                <div className="movement-item" key={movement.id}>
                  <div>
                    <strong>{movement.concept}</strong>
                    <span>
                      {movement.category} · {movement.date}
                    </span>
                  </div>
                  <p className={movement.type === 'income' ? 'income' : 'expense'}>
                    {movement.type === 'income' ? '+' : '-'}
                    {Number(movement.amount).toFixed(2)} €
                  </p>
                </div>
              ))
            )}
          </article>

          <article className="card budget-card">
            <div className="card-header">
              <div>
                <h2>Presupuestos</h2>
                <p>Seguimiento por categorías</p>
              </div>
            </div>

            {userBudgets.length === 0 ? (
              <p>No hay presupuestos definidos este mes.</p>
            ) : (
              userBudgets.slice(0, 3).map((budget) => {
                const spent = getSpentByCategory(budget.category);
                const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;

                let barClass = 'primary-bar';
                if (percentage > 100) barClass = 'danger-bar';
                else if (percentage >= 80) barClass = 'warning-bar';

                return (
                  <div className="budget-item" key={budget.id}>
                    <div className="budget-top">
                      <strong>{budget.category}</strong>
                      <span>
                        {spent.toFixed(2)} / {Number(budget.limit).toFixed(2)} €
                      </span>
                    </div>
                    <div className="progress">
                      <div
                        className={`progress-bar ${barClass}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </article>
        </section>
      </Layout>
    </>
  );
}

export default Dashboard;
