import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loading } from '@/components/ui/loading';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: any;
}

export default function UploadModal({ isOpen, onClose, task }: UploadModalProps) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [comments, setComments] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const submitTaskMutation = useMutation({
    mutationFn: async ({ taskId, submissionUrl, comments }: { taskId: number; submissionUrl: string; comments?: string }) => {
      return apiRequest('POST', `/api/tasks/${taskId}/submit`, { submissionUrl, comments });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/vendor'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/available'] });
      toast({
        title: "Success",
        description: "Task submitted successfully",
      });
      handleClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit task",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsUploading(true);
      const response = await apiRequest('POST', '/api/upload', formData);
      const data = await response.json();
      return data.data.url;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload video",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!videoFile) {
      toast({
        title: "Error",
        description: "Please select a video file",
        variant: "destructive",
      });
      return;
    }

    const submissionUrl = await handleFileUpload(videoFile);
    if (!submissionUrl) return; // Upload failed

    submitTaskMutation.mutate({
      taskId: task.id,
      submissionUrl,
      comments: comments.trim() || undefined
    });
  };

  const handleClose = () => {
    setVideoFile(null);
    setComments('');
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Error",
          description: "Please select a valid video file",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (50MB max)
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size must be less than 50MB",
          variant: "destructive",
        });
        return;
      }
      
      setVideoFile(file);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg" data-testid="modal-upload-task">
        <DialogHeader>
          <DialogTitle>Submit Task Video</DialogTitle>
        </DialogHeader>
        
        {task && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900" data-testid="upload-task-title">
              {task.title}
            </h4>
            <p className="text-sm text-gray-600 mt-1" data-testid="upload-task-description">
              {task.description}
            </p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Video
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-secondary transition-colors">
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
                id="video-upload"
                data-testid="input-video-file"
              />
              <label htmlFor="video-upload" className="cursor-pointer">
                <i className="fas fa-video text-4xl text-gray-400 mb-4"></i>
                <p className="text-gray-600">
                  {videoFile ? videoFile.name : 'Click to upload your submission video'}
                </p>
                <p className="text-sm text-gray-500 mt-2">MP4, AVI, MOV up to 50MB</p>
              </label>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Comments
            </label>
            <Textarea
              placeholder="Any additional notes about your submission..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
              data-testid="textarea-comments"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              type="submit"
              disabled={submitTaskMutation.isPending || isUploading || !videoFile}
              className="flex-1 bg-secondary text-white hover:bg-emerald-600"
              data-testid="button-submit-task"
            >
              {submitTaskMutation.isPending || isUploading ? (
                <Loading size="sm" />
              ) : (
                'Submit Task'
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
