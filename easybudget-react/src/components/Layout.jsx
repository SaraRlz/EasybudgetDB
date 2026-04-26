import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { generateBudgetAlerts } from '../utils/alerts';
import { applyRecurringMovements } from '../utils/recurringMovements';
import Sidebar from './Sidebar';
import Toast from './Toast';

function Layout({ children }) {
  const [toast, setToast] = useState(null);
  const location = useLocation();

  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  useEffect(() => {
    applyRecurringMovements(currentUser);

    const alerts = generateBudgetAlerts(currentUser);

    if (alerts.length > 0) {
      const firstAlert = alerts[0];

      setToast({
        message: firstAlert.title,
        type: firstAlert.type,
      });
    }
  }, [location.pathname, currentUser?.id]);

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="dashboard-layout">
        <Sidebar />
        <main className="main-content">{children}</main>
      </div>
    </>
  );
}

export default Layout;
