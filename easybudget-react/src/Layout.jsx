import Sidebar from './Sidebar';

function Layout({ children }) {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}

export default Layout;
