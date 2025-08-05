import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'wouter';

export default function VendorDashboard() {
  const { user } = useAuth();
  
  const { data: userPackage, isLoading: packageLoading } = useQuery({
    queryKey: ['/api/user/package'],
  });

  const { data: availableTasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['/api/tasks/available'],
  });

  const { data: vendorTasks, isLoading: vendorTasksLoading } = useQuery({
    queryKey: ['/api/tasks/vendor'],
  });

  const { data: referralStats, isLoading: referralLoading } = useQuery({
    queryKey: ['/api/referrals/stats'],
  });

  if (packageLoading || tasksLoading || vendorTasksLoading || referralLoading) {
    return <Loading className="h-64" text="Loading dashboard..." />;
  }

  const completedTasks = Array.isArray(vendorTasks) ? vendorTasks.filter((task: any) => task.status === 'completed' || task.status === 'approved').length : 0;
  const inProgressTasks = Array.isArray(vendorTasks) ? vendorTasks.filter((task: any) => task.status === 'in_progress').length : 0;
  const availableTasksCount = Array.isArray(availableTasks) ? availableTasks.length : 0;

  const packageDetails = userPackage && typeof userPackage === 'object' ? (userPackage as any).packageDetails : null;
  const daysLeft = userPackage && typeof userPackage === 'object' && (userPackage as any).expiresAt ? 
    Math.ceil((new Date((userPackage as any).expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="p-6">
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
            <p className="text-gray-600">Here's what's happening with your tasks today.</p>
          </div>
          <div className="flex items-center space-x-3 bg-green-50 px-4 py-2 rounded-lg">
            <i className="fas fa-coins text-secondary"></i>
            <span className="text-sm font-medium text-secondary" data-testid="total-earnings">
              ₹{referralStats && typeof referralStats === 'object' ? (referralStats as any).totalEarnings || 0 : 0} Earned
            </span>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Tasks</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="stat-available-tasks">
                  {availableTasksCount}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-clipboard-list text-primary text-xl"></i>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Tasks</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="stat-completed-tasks">
                  {completedTasks}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-check-circle text-secondary text-xl"></i>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Skips Remaining</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="stat-skips-remaining">
                  {userPackage && packageDetails && typeof userPackage === 'object' ? 
                    `${packageDetails.skipLimit - ((userPackage as any).skipsUsed || 0)}/${packageDetails.skipLimit}` : 
                    '0/0'
                  }
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-forward text-accent text-xl"></i>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Package Expiry</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="stat-days-left">
                  {daysLeft}
                </p>
                <p className="text-xs text-gray-500">days left</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-calendar text-purple-600 text-xl"></i>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link href="/vendor/tasks">
                <Button
                  variant="ghost"
                  className="w-full justify-between p-4 bg-blue-50 hover:bg-blue-100 text-left"
                  data-testid="button-start-task"
                >
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-play-circle text-primary text-xl"></i>
                    <span className="font-medium text-gray-900">Start New Task</span>
                  </div>
                  <i className="fas fa-arrow-right text-gray-400"></i>
                </Button>
              </Link>
              
              <Link href="/vendor/tasks">
                <Button
                  variant="ghost"
                  className="w-full justify-between p-4 bg-green-50 hover:bg-green-100 text-left"
                  data-testid="button-submit-video"
                >
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-upload text-secondary text-xl"></i>
                    <span className="font-medium text-gray-900">Submit Video</span>
                  </div>
                  <i className="fas fa-arrow-right text-gray-400"></i>
                </Button>
              </Link>
              
              <Link href="/vendor/referrals">
                <Button
                  variant="ghost"
                  className="w-full justify-between p-4 bg-yellow-50 hover:bg-yellow-100 text-left"
                  data-testid="button-share-referral"
                >
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-share text-accent text-xl"></i>
                    <span className="font-medium text-gray-900">Share Referral Link</span>
                  </div>
                  <i className="fas fa-arrow-right text-gray-400"></i>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Tasks */}
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Tasks</h3>
            <div className="space-y-4">
              {Array.isArray(vendorTasks) && vendorTasks.length > 0 ? (
                vendorTasks.slice(0, 3).map((task: any) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg" data-testid={`recent-task-${task.id}`}>
                    <div className="flex items-center space-x-3">
                      {task.mediaUrl && (
                        <img 
                          src={task.mediaUrl} 
                          alt={task.title}
                          className="w-10 h-8 rounded object-cover"
                        />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900" data-testid={`task-title-${task.id}`}>
                          {task.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {task.status === 'in_progress' ? 'In Progress' : 
                           task.status === 'completed' ? 'Completed' :
                           task.status === 'pending_review' ? 'Under Review' :
                           task.status}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      task.status === 'completed' || task.status === 'approved' ? 'bg-green-100 text-green-800' :
                      task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                      task.status === 'pending_review' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`} data-testid={`task-status-${task.id}`}>
                      {task.status === 'pending_review' ? 'Under Review' : 
                       task.status === 'in_progress' ? 'Active' : 
                       task.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <i className="fas fa-tasks text-4xl mb-4"></i>
                  <p>No tasks yet</p>
                  <Link href="/vendor/tasks">
                    <Button className="mt-2" size="sm">
                      Browse Available Tasks
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
