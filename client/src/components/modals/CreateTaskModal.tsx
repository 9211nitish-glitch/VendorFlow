import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loading } from '@/components/ui/loading';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateTaskModal({ isOpen, onClose }: CreateTaskModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    timeLimit: 4,
    assignedTo: 'unassigned',
    mediaFile: null as File | null
  });
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: vendors } = useQuery({
    queryKey: ['/api/users/vendors'],
  });

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      return apiRequest('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Success",
        description: "Task created successfully",
      });
      handleClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create task",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsUploading(true);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      // Use fetch directly for file upload
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type header - browser will set it automatically with boundary for FormData
        },
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }
      
      return data.data.url;
    } catch (error) {
      console.error('File upload error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let mediaUrl = null;
    if (formData.mediaFile) {
      mediaUrl = await handleFileUpload(formData.mediaFile);
      if (!mediaUrl) return; // Upload failed
    }

    const taskData = {
      title: formData.title,
      description: formData.description,
      timeLimit: formData.timeLimit,
      assignedTo: formData.assignedTo === 'unassigned' ? undefined : parseInt(formData.assignedTo),
      mediaUrl
    };

    createTaskMutation.mutate(taskData);
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      timeLimit: 4,
      assignedTo: 'unassigned',
      mediaFile: null
    });
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (1GB max to match server)
      if (file.size > 1000 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size must be less than 1GB",
          variant: "destructive",
        });
        return;
      }
      
      setFormData({ ...formData, mediaFile: file });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="modal-create-task">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Title
            </label>
            <Input
              type="text"
              placeholder="Enter task title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              data-testid="input-task-title"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <Textarea
              placeholder="Describe the task requirements..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={4}
              data-testid="textarea-task-description"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task File/Media
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
              <input
                type="file"
                accept="*/*"
                onChange={handleFileChange}
                className="hidden"
                id="media-upload"
                data-testid="input-media-file"
              />
              <label htmlFor="media-upload" className="cursor-pointer">
                <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"></i>
                <p className="text-gray-600">
                  {formData.mediaFile ? formData.mediaFile.name : 'Click to upload any file (Images, Videos, Documents, Audio, Archives) - up to 1GB'}
                </p>
                <p className="text-sm text-gray-500 mt-2">MP4, AVI, MOV up to 50MB</p>
              </label>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Limit (Hours)
              </label>
              <Input
                type="number"
                placeholder="4"
                min="1"
                max="72"
                value={formData.timeLimit}
                onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) || 4 })}
                required
                data-testid="input-time-limit"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign to Vendor
              </label>
              <Select value={formData.assignedTo} onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}>
                <SelectTrigger data-testid="select-assigned-vendor">
                  <SelectValue placeholder="Select vendor (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {Array.isArray(vendors) && vendors.map((vendor: any) => (
                    <SelectItem key={vendor.id} value={vendor.id.toString()}>
                      {vendor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 pt-4">
            <Button
              type="submit"
              disabled={createTaskMutation.isPending || isUploading}
              className="flex-1"
              data-testid="button-create-task"
            >
              {createTaskMutation.isPending || isUploading ? (
                <Loading size="sm" />
              ) : (
                'Create Task'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              data-testid="button-cancel"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
