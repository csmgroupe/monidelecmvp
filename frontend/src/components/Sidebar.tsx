import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { authSelectors } from '@/modules/auth/application/auth.selectors';
import { useSelector } from 'react-redux';
import { useLogout } from '@/features/shared/hooks/auth/useLogout';
import { useSidebar } from './DashboardLayout';

import {
  LayoutDashboard,
  Table,
  Network,
  LineChart,
  LogOut,
  ChevronRight,
  Settings,
  CreditCard,
  Calculator,
  Wrench
} from 'lucide-react';

interface SidebarItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
  collapsed?: boolean;
  onClick?: () => void;
  active?: boolean;
}

const SidebarItem = ({ icon, label, onClick, active = false, disabled = false, collapsed = false, ...props }: SidebarItemProps) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    if (onClick) {
      onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`w-full flex items-center ${collapsed ? '' : 'space-x-3'} px-4 py-3 rounded-lg transition-all duration-300 ${
        active
          ? 'bg-indigo-50 text-indigo-600'
          : disabled
          ? 'text-gray-400 cursor-not-allowed'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      } relative group`}
      {...props}
    >
      {icon}
      {!collapsed && <span className="font-medium">{label}</span>}
      {collapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50">
          {label}
        </div>
      )}
      {!collapsed && <ChevronRight className="w-4 h-4 ml-auto" />}
      {disabled && (
        <span className={`absolute ${collapsed ? 'right-0' : 'right-0'} top-0 -mt-1 -mr-1 px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-500 rounded-full ${collapsed ? 'hidden' : ''}`}>
          Bientôt disponible
        </span>
      )}
    </button>
  );
};

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { collapsed, setCollapsed } = useSidebar();
  const user = useSelector(authSelectors.getUser);
  const { mutateAsync: signOut } = useLogout();
  // const { subscription } = useSubscription();

  // Debug: Log when sidebar receives new collapsed state
  useEffect(() => {
    console.log('[Sidebar] Received collapsed state:', collapsed);
  }, [collapsed]);

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const modules = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: "Tableau de bord", path: "/dashboard" },
    { icon: <LayoutDashboard className="w-5 h-5" />, label: "ID Plan", path: "/projects" },
    { icon: <Table className="w-5 h-5" />, label: "ID Tableau", path: "/id-tableau", disabled: true },
    { icon: <Network className="w-5 h-5" />, label: "ID Connect", path: "/id-connect", disabled: true },
    { icon: <LineChart className="w-5 h-5" />, label: "ID Sales par ID Recap", path: "/id-sales", disabled: true },
  ];

  const tools = [
    { icon: <Calculator className="w-5 h-5" />, label: "Calculateur PAC", path: "/tools/heat-pump-calculator" },
  ];

  return (
    <div className={`flex flex-col h-full bg-white border-r border-gray-200 transition-all duration-300 ${collapsed ? 'w-20' : 'w-[280px]'}`}>
      <div className="px-4 py-6 relative">
        <Logo variant="sidebar" className="h-12 w-full" collapsed={collapsed} />
        <button
          onClick={(e) => {
            e.stopPropagation();
            setCollapsed(!collapsed);
          }}
          className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors"
        >
          <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {modules.map((module) => (
          <SidebarItem
            key={module.label}
            icon={module.icon}
            label={module.label}
            active={location.pathname === module.path || (module.path === '/projects' && location.pathname.startsWith('/projects'))}
            onClick={() => !module.disabled && handleNavigate(module.path)}
            collapsed={collapsed}
            disabled={module.disabled}
          />
        ))}
      </nav>

      {/* Tools Section */}
      <div className="px-3 py-2">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'px-2'} py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider`}>
          {!collapsed && <Wrench className="w-4 h-4 mr-2" />}
          {!collapsed && 'Outils'}
        </div>
        {tools.map((tool) => (
          <SidebarItem
            key={tool.label}
            icon={tool.icon}
            label={tool.label}
            active={location.pathname === tool.path}
            onClick={() => handleNavigate(tool.path)}
            collapsed={collapsed}
          />
        ))}
      </div>

      <div className={`p-4 border-t border-gray-200 ${collapsed ? 'items-center' : ''}`}>
        {/* <div className={`px-2 py-2 mb-2 bg-gray-50 rounded-lg ${collapsed ? 'text-center' : ''}`}>
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
            <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-2'}`}>
              <CreditCard className="w-4 h-4 text-gray-400" />
              {!collapsed && <span className="text-sm text-gray-600">Projets restants</span>}
            </div>
          </div>
          <div className={`mt-1 flex items-center ${collapsed ? 'justify-center' : ''}`}>
            <span className="text-lg font-semibold text-indigo-600">1</span>
            {!collapsed && <span className="ml-1 text-xs text-red-500">(Bientôt épuisé)</span>}
          </div>
        </div> */}

        <div className={`flex ${collapsed ? 'flex-col' : 'items-center space-x-3'} px-2 py-3`}>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {(user as any)?.user_metadata?.firstName} {(user as any)?.user_metadata?.lastName}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {user?.email}
              </p>
            </div>
          )}
          <div className={`flex ${collapsed ? 'flex-col space-y-2' : 'space-x-2'}`}>
          <button
            onClick={() => handleNavigate('/settings')}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 group relative"
          >
            <Settings className="w-5 h-5" />
            {collapsed && (
              <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                Paramètres
              </span>
            )}
          </button>
          <button
            onClick={handleSignOut}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 group relative"
          >
            <LogOut className="w-5 h-5" />
            {collapsed && (
              <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                Déconnexion
              </span>
            )}
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}