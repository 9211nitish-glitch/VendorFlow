import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loading } from '@/components/ui/loading';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import UploadModal from '@/components/modals/UploadModal';

export default function VendorTasks() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: availableTasks, isLoading: availableLoading } = useQuery({
    queryKey: ['/api/tasks/available'],
  });

  const { data: vendorTasks, isLoading: vendorLoading } = useQuery({
    queryKey: ['/api/tasks/vendor'],
  });

  const { data: userLimits } = useQuery({
    queryKey: ['/api/user/limits'],
  });

  const startTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      return apiRequest('POST', `/api/tasks/${taskId}/start`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/available'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/vendor'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/limits'] });
      toast({
        title: "Success",
        description: "Task started successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to start task",
        variant: "destructive",
      });
    },
  });

  const skipTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      return apiRequest('POST', `/api/tasks/${taskId}/skip`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/available'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/limits'] });
      toast({
        title: "Success",
        description: "Task skipped successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to skip task",
        variant: "destructive",
      });
    },
  });

  const allTasks = [...(vendorTasks || []), ...(availableTasks || [])];
  const filteredTasks = allTasks.filter((task: any) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'available') return task.status === 'available';
    if (statusFilter === 'in_progress') return task.status === 'in_progress';
    if (statusFilter === 'completed') return task.status === 'completed' || task.status === 'approved';
    if (statusFilter === 'missed') return task.status === 'missed';
    return false;
  });

  const handleSubmitTask = (task: any) => {
    setSelectedTask(task);
    setUploadModalOpen(true);
  };

  if (availableLoading || vendorLoading) {
    return <Loading className="h-64" text="Loading tasks..." />;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Tasks</h2>
        <div className="flex items-center space-x-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Tasks" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="missed">Missed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTasks?.map((task: any) => (
          <Card key={task.id} className={`shadow-sm border ${
            task.status === 'in_progress' ? 'border-l-4 border-l-yellow-400' :
            task.status === 'completed' || task.status === 'approved' ? 'border-l-4 border-l-green-400' :
            task.status === 'missed' ? 'border-l-4 border-l-red-400' :
            'border-gray-100'
          }`} data-testid={`task-card-${task.id}`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900" data-testid={`task-title-${task.id}`}>
                    {task.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1" data-testid={`task-description-${task.id}`}>
                    {task.description}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ml-4 ${
                  task.status === 'available' ? 'bg-green-100 text-green-800' :
                  task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                  task.status === 'completed' || task.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                  task.status === 'missed' ? 'bg-red-100 text-red-800' :
                  task.status === 'pending_review' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`} data-testid={`task-status-${task.id}`}>
                  {task.status === 'pending_review' ? 'Under Review' : 
                   task.status === 'in_progress' ? 'In Progress' : 
                   task.status}
                </span>
              </div>
              
              {task.mediaUrl && (
                <div className="mb-4">
                  <img 
                    src={task.mediaUrl} 
                    alt={task.title}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
              )}
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-clock text-gray-400"></i>
                    <span className="text-sm text-gray-600">{task.timeLimit} hours</span>
                  </div>
                </div>
              </div>
              
              {task.status === 'in_progress' && task.startedAt && (
                <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-yellow-800">Time Remaining:</span>
                    <span className="text-lg font-bold text-yellow-800">
                      {/* Calculate remaining time */}
                      Active
                    </span>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-3">
                {task.status === 'available' && (
                  <>
                    <Button
                      onClick={() => startTaskMutation.mutate(task.id)}
                      disabled={!userLimits?.canPerformTask}
                      className="flex-1 bg-secondary text-white hover:bg-emerald-600"
                      data-testid={`button-start-${task.id}`}
                    >
                      Start Task
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => skipTaskMutation.mutate(task.id)}
                      disabled={!userLimits?.canSkip}
                      data-testid={`button-skip-${task.id}`}
                    >
                      Skip
                    </Button>
                  </>
                )}
                
                {task.status === 'in_progress' && (
                  <Button
                    onClick={() => handleSubmitTask(task)}
                    className="flex-1 bg-primary text-white hover:bg-blue-700"
                    data-testid={`button-submit-${task.id}`}
                  >
                    <i className="fas fa-upload mr-2"></i>
                    Submit Video
                  </Button>
                )}
                
                {(task.status === 'completed' || task.status === 'approved') && (
                  <div className="flex-1 text-center py-2 bg-green-50 text-green-800 rounded-lg font-medium">
                    <i className="fas fa-check-circle mr-2"></i>
                    Completed
                  </div>
                )}
                
                {task.status === 'missed' && (
                  <div className="flex-1 text-center py-2 bg-red-50 text-red-800 rounded-lg font-medium">
                    <i className="fas fa-times-circle mr-2"></i>
                    Missed
                  </div>
                )}
                
                {task.status === 'pending_review' && (
                  <div className="flex-1 text-center py-2 bg-purple-50 text-purple-800 rounded-lg font-medium">
                    <i className="fas fa-clock mr-2"></i>
                    Under Review
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {(!filteredTasks || filteredTasks.length === 0) && (
          <div className="col-span-2 text-center py-12 text-gray-500">
            <i className="fas fa-tasks text-4xl mb-4"></i>
            <p>No tasks found</p>
          </div>
        )}
      </div>

      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        task={selectedTask}
      />
    </div>
  );
}
