
import { NavLink } from 'react-router-dom';

const Sidebar = ({ role }) => {
  const menuItems = [
    {
      name: 'Dashboard',
      path: '/',
      roles: ['Admin', 'Manager', 'Sales Executive']
    },
    {
      name: 'Customers',
      path: '/customers',
      roles: ['Admin', 'Manager', 'Sales Executive']
    },
    {
      name: 'Leads',
      path: '/leads',
      roles: ['Admin', 'Manager', 'Sales Executive']
    },
    {
      name: 'Follow-ups',
      path: '/followups',
      roles: ['Admin', 'Manager', 'Sales Executive']
    },
    {
      name: 'Opportunities',
      path: '/opportunities',
      roles: ['Admin', 'Manager', 'Sales Executive']
    },
    {
      name: 'Activities',
      path: '/activities',
      roles: ['Admin', 'Manager', 'Sales Executive']
    },
    {
      name: 'User Management',
      path: '/users',
      roles: ['Admin']
    },
    {
      name: 'Audit Logs',
      path: '/audit-logs',
      roles: ['Admin']
    }
  ];

  // Show menu items according to the logged-in user's role
  const visibleItems = menuItems.filter((item) =>
    item.roles.includes(role)
  );

  return (
    <aside className="flex min-h-screen w-64 flex-col bg-slate-900 p-5 text-white">
      {/* Application Logo */}
      <h1 className="mb-10 text-2xl font-bold text-blue-400">
        AcxiomCRM
      </h1>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-2">
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `block rounded-lg px-4 py-3 transition ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-8 border-t border-slate-700 pt-4">
        <p className="text-xs text-slate-400">
          AcxiomCRM
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Sales Management System
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
