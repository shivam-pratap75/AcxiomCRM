
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = () => {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar role={user.role} />

      <div className="flex-1 min-w-0">
        <Header user={user} />

        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
