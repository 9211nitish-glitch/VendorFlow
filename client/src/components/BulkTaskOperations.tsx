import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  CheckSquare, 
  X, 
  Trash2, 
  UserPlus, 
  Settings,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface Task {
  id: number;
  title: string;
  status: string;
  assignedTo?: number;
  assignedToName?: string;
  createdAt: string;
}

interface BulkTaskOperationsProps {
  tasks: Task[];
  selectedTasks: number[];
  onSelectionChange: (taskIds: number[]) => void;
  onClose: () => void;
  vendors?: Array<{ id: number; name: string; email: string }>;
}

export function BulkTaskOperations({
  tasks,
  selectedTasks,
  onSelectionChange,
  onClose,
  vendors = []
}: BulkTaskOperationsProps) {
  const [bulkAction, setBulkAction] = useState<string>('');
  const [selectedVendor, setSelectedVendor] = useState<string>('');
  const [newStatus, setNewStatus] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const bulkOperationMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/tasks/bulk', data);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/filtered'] });
      
      toast({
        title: "Success",
        description: response.message,
      });
      
      onSelectionChange([]);
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to perform bulk operation",
        variant: "destructive",
      });
    },
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(tasks.map(task => task.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleTaskSelection = (taskId: number, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedTasks, taskId]);
    } else {
      onSelectionChange(selectedTasks.filter(id => id !== taskId));
    }
  };

  const handleBulkOperation = () => {
    if (!bulkAction || selectedTasks.length === 0) return;

    const operationData: any = {
      taskIds: selectedTasks,
      action: bulkAction
    };

    if (bulkAction === 'assign' && selectedVendor) {
      operationData.vendorId = parseInt(selectedVendor);
    }

    if (bulkAction === 'status' && newStatus) {
      operationData.status = newStatus;
    }

    if (bulkAction === 'reject' && rejectionReason) {
      operationData.rejectionReason = rejectionReason;
    }

    bulkOperationMutation.mutate(operationData);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'approve':
        return <CheckSquare className="h-4 w-4 text-green-600" />;
      case 'reject':
        return <X className="h-4 w-4 text-red-600" />;
      case 'delete':
        return <Trash2 className="h-4 w-4 text-red-600" />;
      case 'assign':
        return <UserPlus className="h-4 w-4 text-blue-600" />;
      case 'status':
        return <Settings className="h-4 w-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const isActionDisabled = () => {
    if (!bulkAction || selectedTasks.length === 0) return true;
    if (bulkAction === 'assign' && !selectedVendor) return true;
    if (bulkAction === 'status' && !newStatus) return true;
    return false;
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Bulk Task Operations</span>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Task Selection */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <Label className="text-base font-medium">Select Tasks</Label>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={selectedTasks.length === tasks.length && tasks.length > 0}
                  onCheckedChange={handleSelectAll}
                  data-testid="checkbox-select-all"
                />
                <Label htmlFor="select-all" className="text-sm">
                  Select All ({tasks.length})
                </Label>
              </div>
              <Badge variant="secondary">
                {selectedTasks.length} selected
              </Badge>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto border rounded-lg">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-center space-x-3 p-3 border-b last:border-b-0 ${
                  selectedTasks.includes(task.id) ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                <Checkbox
                  id={`task-${task.id}`}
                  checked={selectedTasks.includes(task.id)}
                  onCheckedChange={(checked) => handleTaskSelection(task.id, !!checked)}
                  data-testid={`checkbox-task-${task.id}`}
                />
                <div className="flex-1">
                  <div className="font-medium">{task.title}</div>
                  <div className="text-sm text-gray-500">
                    Status: <Badge variant="outline">{task.status}</Badge>
                    {task.assignedToName && (
                      <span className="ml-2">
                        Assigned to: {task.assignedToName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Selection */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Select Action</Label>
          
          <Select value={bulkAction} onValueChange={setBulkAction}>
            <SelectTrigger data-testid="select-bulk-action">
              <SelectValue placeholder="Choose an action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="approve">
                <div className="flex items-center space-x-2">
                  {getActionIcon('approve')}
                  <span>Approve Tasks</span>
                </div>
              </SelectItem>
              <SelectItem value="reject">
                <div className="flex items-center space-x-2">
                  {getActionIcon('reject')}
                  <span>Reject Tasks</span>
                </div>
              </SelectItem>
              <SelectItem value="delete">
                <div className="flex items-center space-x-2">
                  {getActionIcon('delete')}
                  <span>Delete Tasks</span>
                </div>
              </SelectItem>
              <SelectItem value="assign">
                <div className="flex items-center space-x-2">
                  {getActionIcon('assign')}
                  <span>Assign to Vendor</span>
                </div>
              </SelectItem>
              <SelectItem value="status">
                <div className="flex items-center space-x-2">
                  {getActionIcon('status')}
                  <span>Change Status</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Additional Fields Based on Action */}
          {bulkAction === 'assign' && (
            <div>
              <Label htmlFor="vendor-select">Select Vendor</Label>
              <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                <SelectTrigger id="vendor-select" data-testid="select-vendor">
                  <SelectValue placeholder="Choose a vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id.toString()}>
                      {vendor.name} ({vendor.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {bulkAction === 'status' && (
            <div>
              <Label htmlFor="status-select">Select New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger id="status-select" data-testid="select-status">
                  <SelectValue placeholder="Choose a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="pending_review">Pending Review</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="missed">Missed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {bulkAction === 'reject' && (
            <div>
              <Label htmlFor="rejection-reason">Rejection Reason (Optional)</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Enter reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                data-testid="textarea-rejection-reason"
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="outline" onClick={onClose} data-testid="button-cancel">
            Cancel
          </Button>
          
          <Button
            onClick={handleBulkOperation}
            disabled={isActionDisabled() || bulkOperationMutation.isPending}
            data-testid="button-execute-bulk"
          >
            {bulkOperationMutation.isPending && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            {getActionIcon(bulkAction)}
            <span className="ml-2">
              Execute on {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''}
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}