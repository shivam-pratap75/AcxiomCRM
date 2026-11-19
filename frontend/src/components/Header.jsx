
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = ({ user }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
      <h2 className="text-xl font-semibold text-slate-800">
        Dashboard
      </h2>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="font-medium text-slate-800">{user.name}</p>
          <p className="text-sm text-slate-500">{user.role}</p>
        </div>

        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
          {user.name.charAt(0).toUpperCase()}
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
