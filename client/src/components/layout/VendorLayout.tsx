import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/components/NotificationBell';
import { Menu, X, Home, CheckSquare, Users, UserCheck, Gift, LogOut, Wallet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface VendorLayoutProps {
  children: ReactNode;
}

export default function VendorLayout({ children }: VendorLayoutProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { data: userPackage } = useQuery({
    queryKey: ['/api/user/package'],
    retry: false
  });

  const { data: referralStats } = useQuery({
    queryKey: ['/api/referrals/stats'],
    retry: false
  });

  const navItems = [
    { 
      label: 'Dashboard', 
      href: '/vendor', 
      icon: Home,
      isActive: location === '/vendor' 
    },
    { 
      label: 'Tasks', 
      href: '/vendor/tasks', 
      icon: CheckSquare,
      isActive: location === '/vendor/tasks' 
    },
    { 
      label: 'Package', 
      href: '/vendor/package', 
      icon: Gift,
      isActive: location === '/vendor/package' || location === '/vendor/packages'
    },
    { 
      label: 'Wallet', 
      href: '/vendor/wallet', 
      icon: Wallet,
      isActive: location === '/vendor/wallet' 
    },
    { 
      label: 'Profile', 
      href: '/vendor/profile', 
      icon: Users,
      isActive: location === '/vendor/profile' 
    },
    { 
      label: 'Referrals', 
      href: '/vendor/referrals', 
      icon: Gift,
      isActive: location === '/vendor/referrals' 
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
              Task Manager
            </h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <NotificationBell />
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
            <div className="flex items-center justify-between px-4 py-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <CheckSquare className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Task Manager
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Vendor Dashboard
                  </p>
                </div>
              </div>
              <NotificationBell />
            </div>

            {/* User Info */}
            <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user?.name?.charAt(0).toUpperCase() || 'V'}
                  </span>
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user?.name || 'Vendor'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
              
              {/* Package Status */}
              {userPackage?.data ? (
                <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-green-700 dark:text-green-400">
                      {(userPackage as any).data.name}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      Active
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-xs text-yellow-700 dark:text-yellow-400">
                    No active package
                  </p>
                </div>
              )}

              {/* Referral Stats */}
              {referralStats?.data && (
                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-blue-700 dark:text-blue-400">
                      Referrals: {(referralStats as any).data.totalReferrals}
                    </span>
                    <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
                      ₹{(referralStats as any).data.totalEarnings}
                    </span>
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
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                      }`}
                      data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
                    >
                      <Icon className={`mr-3 h-5 w-5 ${
                        item.isActive 
                          ? 'text-blue-500 dark:text-blue-300' 
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
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <CheckSquare className="h-5 w-5 text-white" />
                    </div>
                    <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Task Manager
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
                    <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {user?.name?.charAt(0).toUpperCase() || 'V'}
                      </span>
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {user?.name || 'Vendor'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  
                  {/* Package Status */}
                  {userPackage?.data ? (
                    <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-green-700 dark:text-green-400">
                          {(userPackage as any).data.name}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          Active
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <p className="text-xs text-yellow-700 dark:text-yellow-400">
                        No active package
                      </p>
                    </div>
                  )}

                  {/* Referral Stats */}
                  {referralStats?.data && (
                    <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-blue-700 dark:text-blue-400">
                          Referrals: {(referralStats as any).data.totalReferrals}
                        </span>
                        <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
                          ₹{(referralStats as any).data.totalEarnings}
                        </span>
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
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                          }`}
                          onClick={closeMobileMenu}
                          data-testid={`mobile-nav-${item.label.toLowerCase().replace(' ', '-')}`}
                        >
                          <Icon className={`mr-3 h-5 w-5 ${
                            item.isActive 
                              ? 'text-blue-500 dark:text-blue-300' 
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