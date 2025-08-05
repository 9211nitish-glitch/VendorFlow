import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loading } from '@/components/ui/loading';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { TaskStatus } from '@shared/schema';
import CreateTaskModal from '@/components/modals/CreateTaskModal';

export default function TaskManagement() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['/api/tasks'],
  });

  const { data: vendors } = useQuery({
    queryKey: ['/api/users/vendors'],
  });

  const updateTaskStatusMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: number; status: TaskStatus }) => {
      return apiRequest('PATCH', `/api/tasks/${taskId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Success",
        description: "Task status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update task status",
        variant: "destructive",
      });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      return apiRequest('DELETE', `/api/tasks/${taskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete task",
        variant: "destructive",
      });
    },
  });

  const filteredTasks = tasks?.filter((task: any) => {
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (isLoading) {
    return <Loading className="h-64" text="Loading tasks..." />;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Task Management</h2>
        <Button
          onClick={() => setShowCreateModal(true)}
          data-testid="button-create-task"
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <i className="fas fa-plus"></i>
          <span>Create Task</span>
        </Button>
      </div>

      {/* Filters */}
      <Card className="shadow-sm border border-gray-100 mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center space-x-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="missed">Missed</SelectItem>
                <SelectItem value="pending_review">Pending Review</SelectItem>
              </SelectContent>
            </Select>
            
            <Input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="input-search-tasks"
              className="max-w-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Task Table */}
      <Card className="shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Task
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time Limit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredTasks?.map((task: any) => (
                <tr key={task.id} className="hover:bg-gray-50" data-testid={`row-task-${task.id}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      {task.mediaUrl && (
                        <img 
                          src={task.mediaUrl} 
                          alt={task.title}
                          className="w-12 h-8 rounded object-cover"
                        />
                      )}
                      <div>
                        <p className="font-medium text-gray-900" data-testid={`text-task-title-${task.id}`}>
                          {task.title}
                        </p>
                        <p className="text-sm text-gray-500" data-testid={`text-task-description-${task.id}`}>
                          {task.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {task.assignedTo ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">
                            {vendors?.find((v: any) => v.id === task.assignedTo)?.name?.substring(0, 2) || 'UN'}
                          </span>
                        </div>
                        <span className="text-sm text-gray-900">
                          {vendors?.find((v: any) => v.id === task.assignedTo)?.name || 'Unknown'}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      task.status === 'available' ? 'bg-green-100 text-green-800' :
                      task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                      task.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      task.status === 'missed' ? 'bg-red-100 text-red-800' :
                      task.status === 'pending_review' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`} data-testid={`status-task-${task.id}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-clock text-gray-400"></i>
                      <span className="text-sm text-gray-600">{task.timeLimit}h</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {task.status === 'pending_review' && (
                        <>
                          <button
                            onClick={() => updateTaskStatusMutation.mutate({ taskId: task.id, status: TaskStatus.APPROVED })}
                            className="text-green-600 hover:text-green-800"
                            data-testid={`button-approve-${task.id}`}
                          >
                            <i className="fas fa-check"></i>
                          </button>
                          <button
                            onClick={() => updateTaskStatusMutation.mutate({ taskId: task.id, status: TaskStatus.REJECTED })}
                            className="text-red-600 hover:text-red-800"
                            data-testid={`button-reject-${task.id}`}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => deleteTaskMutation.mutate(task.id)}
                        className="text-red-600 hover:text-red-800"
                        data-testid={`button-delete-${task.id}`}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {(!filteredTasks || filteredTasks.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <i className="fas fa-tasks text-4xl mb-4"></i>
                    <p>No tasks found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <CreateTaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}
