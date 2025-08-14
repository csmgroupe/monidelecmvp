import { ReactNode, createContext, useContext, useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

// Context pour partager l'état collapsed de la sidebar
interface SidebarContextType {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  // Initialize state from localStorage with a proper type check
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const savedState = localStorage.getItem('sidebar-collapsed');
      return savedState !== null ? JSON.parse(savedState) : false;
    } catch {
      return false;
    }
  });

  // Update localStorage whenever collapsed changes
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      <div className="flex h-screen bg-gray-50">
        <div className="flex-shrink-0">
          <Sidebar />
        </div>
        <div id="main-content" className="flex-1 overflow-auto pb-10">
          {children}
        </div>
      </div>
    </SidebarContext.Provider>
  );
};
