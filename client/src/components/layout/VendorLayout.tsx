import { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';

interface VendorLayoutProps {
  children: ReactNode;
}

export default function VendorLayout({ children }: VendorLayoutProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const { data: referralStats } = useQuery({
    queryKey: ['/api/referrals/stats'],
  });

  const navigation = [
    { name: 'Dashboard', href: '/vendor/dashboard', icon: 'fa-chart-pie' },
    { name: 'My Tasks', href: '/vendor/tasks', icon: 'fa-tasks' },
    { name: 'Package Info', href: '/vendor/package', icon: 'fa-box' },
    { name: 'Referrals', href: '/vendor/referrals', icon: 'fa-share-alt' },
    { name: 'Profile', href: '/vendor/profile', icon: 'fa-user' },
  ];

  const isActive = (href: string) => {
    return location === href || (href === '/vendor/dashboard' && location === '/vendor');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm h-screen fixed left-0 top-0">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                <i className="fas fa-user text-white text-lg"></i>
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Vendor Panel</h2>
                <p className="text-sm text-gray-500" data-testid="vendor-name">
                  {user?.name}
                </p>
              </div>
            </div>
          </div>
          
          <nav className="mt-6">
            <div className="px-4 space-y-2">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <button
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive(item.href)
                        ? 'bg-emerald-50 text-secondary'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    data-testid={`nav-${item.name.toLowerCase().replace(' ', '-')}`}
                  >
                    <i className={`fas ${item.icon} w-5 h-5 mr-3`}></i>
                    {item.name}
                  </button>
                </Link>
              ))}
            </div>
          </nav>
          
          <div className="absolute bottom-0 w-64 p-4 border-t border-gray-100">
            <Button
              variant="ghost"
              onClick={logout}
              className="w-full justify-start text-red-600 hover:bg-red-50"
              data-testid="button-logout"
            >
              <i className="fas fa-sign-out-alt w-5 h-5 mr-3"></i>
              Logout
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-64">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-100 px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                {navigation.find(item => isActive(item.href))?.name || 'My Dashboard'}
              </h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3 bg-green-50 px-4 py-2 rounded-lg">
                  <i className="fas fa-coins text-secondary"></i>
                  <span className="text-sm font-medium text-secondary" data-testid="header-earnings">
                    ₹{referralStats && typeof referralStats === 'object' ? (referralStats as any).totalEarnings || 0 : 0} Earned
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.name?.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="min-h-screen">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
