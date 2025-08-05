import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
  });

  if (isLoading) {
    return <Loading className="h-64" text="Loading dashboard..." />;
  }

  return (
    <div className="p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="stat-total-users">
                  {stats?.totalUsers || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-users text-primary text-xl"></i>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-sm text-green-600">+12% from last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Tasks</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="stat-active-tasks">
                  {stats?.activeTasks || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-tasks text-secondary text-xl"></i>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-sm text-green-600">+5 new today</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Tasks</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="stat-completed-tasks">
                  {stats?.completedTasks || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-check-circle text-accent text-xl"></i>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-sm text-green-600">+89% completion rate</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="stat-total-revenue">
                  ₹{stats?.totalRevenue || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-rupee-sign text-purple-600 text-xl"></i>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-sm text-green-600">+23% from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Task Submissions</h3>
            <div className="space-y-4">
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-inbox text-4xl mb-4"></i>
                <p>No recent submissions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Alerts</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <i className="fas fa-info-circle text-blue-500 mt-1"></i>
                <div>
                  <p className="text-sm font-medium text-blue-900">System Status</p>
                  <p className="text-xs text-blue-600">All systems are operational</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
