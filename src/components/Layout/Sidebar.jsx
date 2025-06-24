
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Router, 
  List, 
  Shield, 
  RefreshCw, 
  Archive,
  Users,
  BarChart3
} from 'lucide-react';

const menuItems = [
  { 
    path: '/', 
    icon: Home, 
    label: 'Dashboard',
    description: 'Panoramica generale'
  },
  { 
    path: '/routers', 
    icon: Router, 
    label: 'Router',
    description: 'Gestione router'
  },
  { 
    path: '/address-lists', 
    icon: List, 
    label: 'Address Lists',
    description: 'Gestione indirizzi'
  },
  { 
    path: '/firewall', 
    icon: Shield, 
    label: 'Firewall Rules',
    description: 'Regole firewall'
  },
  { 
    path: '/sync', 
    icon: RefreshCw, 
    label: 'Sincronizzazione',
    description: 'Sync configurazioni'
  },
  { 
    path: '/backup', 
    icon: Archive, 
    label: 'Backup',
    description: 'Gestione backup'
  },
  { 
    path: '/users', 
    icon: Users, 
    label: 'Utenti',
    description: 'Gestione utenti'
  },
  { 
    path: '/reports', 
    icon: BarChart3, 
    label: 'Reports',
    description: 'Statistiche e report'
  },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <div className="flex-1">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-gray-500">{item.description}</div>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
