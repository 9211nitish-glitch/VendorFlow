import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  X, 
  Home, 
  CheckSquare, 
  Users, 
  Package, 
  Gift, 
  CreditCard, 
  LogOut,
  Settings
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { data: dashboardStats } = useQuery({
    queryKey: ['/api/admin/stats'],
    retry: false
  });

  const navItems = [
    { 
      label: 'Dashboard', 
      href: '/admin', 
      icon: Home,
      isActive: location === '/admin' 
    },
    { 
      label: 'Tasks', 
      href: '/admin/tasks', 
      icon: CheckSquare,
      isActive: location === '/admin/tasks' 
    },
    { 
      label: 'Users', 
      href: '/admin/users', 
      icon: Users,
      isActive: location === '/admin/users' 
    },
    { 
      label: 'Packages', 
      href: '/admin/packages', 
      icon: Package,
      isActive: location === '/admin/packages' 
    },
    { 
      label: 'Referrals', 
      href: '/admin/referrals', 
      icon: Gift,
      isActive: location === '/admin/referrals' 
    },
    { 
      label: 'Payments', 
      href: '/admin/payments', 
      icon: CreditCard,
      isActive: location === '/admin/payments' 
    }
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="p-2"
              data-testid="button-mobile-menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              Admin Panel
            </h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="p-2"
              data-testid="button-mobile-logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
          <div className="flex flex-col flex-grow bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center px-4 py-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Admin Panel
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Management Dashboard
                  </p>
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user?.name?.charAt(0).toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user?.name || 'Administrator'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
              
              <Badge variant="default" className="mt-3 bg-red-500 hover:bg-red-600">
                Administrator
              </Badge>

              {/* Quick Stats */}
              {dashboardStats?.data && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-xs text-blue-600 dark:text-blue-400">Users</p>
                    <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                      {dashboardStats.data.totalUsers}
                    </p>
                  </div>
                  <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-xs text-green-600 dark:text-green-400">Tasks</p>
                    <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                      {dashboardStats.data.totalTasks}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                        item.isActive
                          ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                      }`}
                      data-testid={`nav-${item.label.toLowerCase()}`}
                    >
                      <Icon className={`mr-3 h-5 w-5 ${
                        item.isActive 
                          ? 'text-red-500 dark:text-red-300' 
                          : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-400'
                      }`} />
                      {item.label}
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* Logout Button */}
            <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                onClick={logout}
                data-testid="button-logout"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div 
              className="fixed inset-0 bg-gray-600 bg-opacity-75"
              onClick={closeMobileMenu}
              data-testid="mobile-menu-overlay"
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-gray-800">
              {/* Mobile Sidebar Content */}
              <div className="flex flex-col flex-grow overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
                      <Settings className="h-5 w-5 text-white" />
                    </div>
                    <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Admin Panel
                    </h1>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={closeMobileMenu}
                    className="p-2"
                    data-testid="button-close-mobile-menu"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* User Info */}
                <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {user?.name?.charAt(0).toUpperCase() || 'A'}
                      </span>
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {user?.name || 'Administrator'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  
                  <Badge variant="default" className="mt-3 bg-red-500 hover:bg-red-600">
                    Administrator
                  </Badge>

                  {/* Quick Stats */}
                  {dashboardStats?.data && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-xs text-blue-600 dark:text-blue-400">Users</p>
                        <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                          {dashboardStats.data.totalUsers}
                        </p>
                      </div>
                      <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-xs text-green-600 dark:text-green-400">Tasks</p>
                        <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                          {dashboardStats.data.totalTasks}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-4 space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.href} href={item.href}>
                        <div
                          className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                            item.isActive
                              ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                          }`}
                          onClick={closeMobileMenu}
                          data-testid={`mobile-nav-${item.label.toLowerCase()}`}
                        >
                          <Icon className={`mr-3 h-5 w-5 ${
                            item.isActive 
                              ? 'text-red-500 dark:text-red-300' 
                              : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-400'
                          }`} />
                          {item.label}
                        </div>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 lg:ml-64">
          <main className="p-4 lg:p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}