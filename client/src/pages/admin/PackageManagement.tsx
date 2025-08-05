import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Package, InsertPackage, PackageType } from '@shared/schema';
import { Plus, Edit, Trash2, DollarSign, Clock, Users } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

export default function PackageManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

  const { data: packages, isLoading } = useQuery<Package[]>({
    queryKey: ['/api/packages'],
  });

  const createPackageMutation = useMutation({
    mutationFn: (data: InsertPackage) => apiRequest('/api/admin/packages', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/packages'] });
      setCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "Package created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create package",
        variant: "destructive",
      });
    },
  });

  const updatePackageMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertPackage> }) => 
      apiRequest(`/api/admin/packages/${id}`, 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/packages'] });
      setEditDialogOpen(false);
      setSelectedPackage(null);
      toast({
        title: "Success",
        description: "Package updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update package",
        variant: "destructive",
      });
    },
  });

  const deletePackageMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/packages/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/packages'] });
      toast({
        title: "Success",
        description: "Package deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete package",
        variant: "destructive",
      });
    },
  });

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const packageData: InsertPackage = {
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      taskLimit: parseInt(formData.get('taskLimit') as string),
      skipLimit: parseInt(formData.get('skipLimit') as string),
      validityDays: parseInt(formData.get('validityDays') as string),
      price: parseFloat(formData.get('price') as string),
      dailyTaskLimit: parseInt(formData.get('dailyTaskLimit') as string) || 0,
      soloEarn: parseFloat(formData.get('soloEarn') as string) || 0,
      dualEarn: parseFloat(formData.get('dualEarn') as string) || 0,
      earnTask: parseFloat(formData.get('earnTask') as string) || 0,
      igLimitMin: formData.get('igLimitMin') as string || '0',
      ytLimitMin: formData.get('ytLimitMin') as string || '0',
      kitBox: formData.get('kitBox') as string || undefined,
      premiumSubscription: formData.get('premiumSubscription') === 'on',
      onsiteVideoVisit: formData.get('onsiteVideoVisit') === 'on',
      pentaRefEarning: formData.get('pentaRefEarning') === 'on',
      remoWork: formData.get('remoWork') === 'on',
      isActive: formData.get('isActive') === 'on',
    };

    createPackageMutation.mutate(packageData);
  };

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPackage) return;

    const formData = new FormData(e.currentTarget);
    
    const packageData: Partial<InsertPackage> = {
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      taskLimit: parseInt(formData.get('taskLimit') as string),
      skipLimit: parseInt(formData.get('skipLimit') as string),
      validityDays: parseInt(formData.get('validityDays') as string),
      price: parseFloat(formData.get('price') as string),
      dailyTaskLimit: parseInt(formData.get('dailyTaskLimit') as string) || 0,
      soloEarn: parseFloat(formData.get('soloEarn') as string) || 0,
      dualEarn: parseFloat(formData.get('dualEarn') as string) || 0,
      earnTask: parseFloat(formData.get('earnTask') as string) || 0,
      igLimitMin: formData.get('igLimitMin') as string || '0',
      ytLimitMin: formData.get('ytLimitMin') as string || '0',
      kitBox: formData.get('kitBox') as string || undefined,
      premiumSubscription: formData.get('premiumSubscription') === 'on',
      onsiteVideoVisit: formData.get('onsiteVideoVisit') === 'on',
      pentaRefEarning: formData.get('pentaRefEarning') === 'on',
      remoWork: formData.get('remoWork') === 'on',
      isActive: formData.get('isActive') === 'on',
    };

    updatePackageMutation.mutate({ id: selectedPackage.id, data: packageData });
  };

  const handleDeletePackage = (packageId: number) => {
    if (window.confirm('Are you sure you want to delete this package? This action cannot be undone.')) {
      deletePackageMutation.mutate(packageId);
    }
  };

  const openEditDialog = (pkg: Package) => {
    setSelectedPackage(pkg);
    setEditDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Package Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Create, edit, and manage subscription packages</p>
        </div>
        
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-package">
              <Plus className="h-4 w-4 mr-2" />
              Create Package
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Package</DialogTitle>
              <DialogDescription>
                Add a new subscription package to the system
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Package Name</Label>
                  <Input id="name" name="name" required data-testid="input-package-name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Package Type</Label>
                  <Select name="type" required>
                    <SelectTrigger data-testid="select-package-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="onsite">Onsite</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input id="price" name="price" type="number" step="0.01" required data-testid="input-price" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taskLimit">Task Limit</Label>
                  <Input id="taskLimit" name="taskLimit" type="number" required data-testid="input-task-limit" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="skipLimit">Skip Limit</Label>
                  <Input id="skipLimit" name="skipLimit" type="number" required data-testid="input-skip-limit" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="validityDays">Validity (Days)</Label>
                  <Input id="validityDays" name="validityDays" type="number" required data-testid="input-validity" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dailyTaskLimit">Daily Task Limit</Label>
                  <Input id="dailyTaskLimit" name="dailyTaskLimit" type="number" defaultValue="0" data-testid="input-daily-limit" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="soloEarn">Solo Earn (₹)</Label>
                  <Input id="soloEarn" name="soloEarn" type="number" step="0.01" defaultValue="0" data-testid="input-solo-earn" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dualEarn">Dual Earn (₹)</Label>
                  <Input id="dualEarn" name="dualEarn" type="number" step="0.01" defaultValue="0" data-testid="input-dual-earn" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="earnTask">Earn Task (₹)</Label>
                  <Input id="earnTask" name="earnTask" type="number" step="0.01" defaultValue="0" data-testid="input-earn-task" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="igLimitMin">IG Limit Min</Label>
                  <Input id="igLimitMin" name="igLimitMin" defaultValue="0" data-testid="input-ig-limit" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ytLimitMin">YT Limit Min</Label>
                  <Input id="ytLimitMin" name="ytLimitMin" defaultValue="0" data-testid="input-yt-limit" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kitBox">Kit Box</Label>
                  <Input id="kitBox" name="kitBox" placeholder="Optional" data-testid="input-kit-box" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="premiumSubscription" name="premiumSubscription" defaultChecked data-testid="checkbox-premium-subscription" />
                  <Label htmlFor="premiumSubscription">Premium Subscription</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="onsiteVideoVisit" name="onsiteVideoVisit" data-testid="checkbox-onsite-video" />
                  <Label htmlFor="onsiteVideoVisit">Onsite Video Visit</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="pentaRefEarning" name="pentaRefEarning" defaultChecked data-testid="checkbox-penta-ref" />
                  <Label htmlFor="pentaRefEarning">Penta Ref Earning</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="remoWork" name="remoWork" data-testid="checkbox-remo-work" />
                  <Label htmlFor="remoWork">Remote Work</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="isActive" name="isActive" defaultChecked data-testid="checkbox-is-active" />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createPackageMutation.isPending} data-testid="button-submit-create">
                  {createPackageMutation.isPending ? 'Creating...' : 'Create Package'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages?.map((pkg) => (
          <Card key={pkg.id} className="hover:shadow-lg transition-shadow" data-testid={`card-package-${pkg.id}`}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg" data-testid={`text-package-name-${pkg.id}`}>{pkg.name}</CardTitle>
                  <CardDescription>
                    <Badge variant={pkg.type === 'onsite' ? 'default' : 'secondary'}>
                      {pkg.type.toUpperCase()}
                    </Badge>
                  </CardDescription>
                </div>
                <div className="flex space-x-1">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => openEditDialog(pkg)}
                    data-testid={`button-edit-${pkg.id}`}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={() => handleDeletePackage(pkg.id)}
                    data-testid={`button-delete-${pkg.id}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <DollarSign className="h-4 w-4 mr-1" />
                    Price
                  </span>
                  <span className="font-semibold" data-testid={`text-price-${pkg.id}`}>₹{pkg.price}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Users className="h-4 w-4 mr-1" />
                    Tasks
                  </span>
                  <span data-testid={`text-task-limit-${pkg.id}`}>{pkg.taskLimit}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="h-4 w-4 mr-1" />
                    Validity
                  </span>
                  <span data-testid={`text-validity-${pkg.id}`}>{pkg.validityDays} days</span>
                </div>

                {pkg.soloEarn > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Solo Earn</span>
                    <span>₹{pkg.soloEarn}</span>
                  </div>
                )}

                {pkg.dualEarn > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Dual Earn</span>
                    <span>₹{pkg.dualEarn}</span>
                  </div>
                )}

                {pkg.earnTask > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Earn Task</span>
                    <span>₹{pkg.earnTask}</span>
                  </div>
                )}

                {pkg.kitBox && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Kit Box</span>
                    <Badge variant="outline">{pkg.kitBox}</Badge>
                  </div>
                )}

                <div className="flex flex-wrap gap-1 mt-3">
                  {pkg.premiumSubscription && <Badge variant="secondary" className="text-xs">Premium</Badge>}
                  {pkg.onsiteVideoVisit && <Badge variant="secondary" className="text-xs">Onsite Video</Badge>}
                  {pkg.pentaRefEarning && <Badge variant="secondary" className="text-xs">Penta Ref</Badge>}
                  {pkg.remoWork && <Badge variant="secondary" className="text-xs">Remote Work</Badge>}
                  {!pkg.isActive && <Badge variant="destructive" className="text-xs">Inactive</Badge>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Package</DialogTitle>
            <DialogDescription>
              Update package details
            </DialogDescription>
          </DialogHeader>
          {selectedPackage && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Package Name</Label>
                  <Input id="edit-name" name="name" defaultValue={selectedPackage.name} required data-testid="input-edit-name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-type">Package Type</Label>
                  <Select name="type" defaultValue={selectedPackage.type} required>
                    <SelectTrigger data-testid="select-edit-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="onsite">Onsite</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Price (₹)</Label>
                  <Input id="edit-price" name="price" type="number" step="0.01" defaultValue={selectedPackage.price} required data-testid="input-edit-price" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-taskLimit">Task Limit</Label>
                  <Input id="edit-taskLimit" name="taskLimit" type="number" defaultValue={selectedPackage.taskLimit} required data-testid="input-edit-task-limit" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-skipLimit">Skip Limit</Label>
                  <Input id="edit-skipLimit" name="skipLimit" type="number" defaultValue={selectedPackage.skipLimit} required data-testid="input-edit-skip-limit" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-validityDays">Validity (Days)</Label>
                  <Input id="edit-validityDays" name="validityDays" type="number" defaultValue={selectedPackage.validityDays} required data-testid="input-edit-validity" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-dailyTaskLimit">Daily Task Limit</Label>
                  <Input id="edit-dailyTaskLimit" name="dailyTaskLimit" type="number" defaultValue={selectedPackage.dailyTaskLimit} data-testid="input-edit-daily-limit" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-soloEarn">Solo Earn (₹)</Label>
                  <Input id="edit-soloEarn" name="soloEarn" type="number" step="0.01" defaultValue={selectedPackage.soloEarn} data-testid="input-edit-solo-earn" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-dualEarn">Dual Earn (₹)</Label>
                  <Input id="edit-dualEarn" name="dualEarn" type="number" step="0.01" defaultValue={selectedPackage.dualEarn} data-testid="input-edit-dual-earn" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-earnTask">Earn Task (₹)</Label>
                  <Input id="edit-earnTask" name="earnTask" type="number" step="0.01" defaultValue={selectedPackage.earnTask} data-testid="input-edit-earn-task" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-igLimitMin">IG Limit Min</Label>
                  <Input id="edit-igLimitMin" name="igLimitMin" defaultValue={selectedPackage.igLimitMin} data-testid="input-edit-ig-limit" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-ytLimitMin">YT Limit Min</Label>
                  <Input id="edit-ytLimitMin" name="ytLimitMin" defaultValue={selectedPackage.ytLimitMin} data-testid="input-edit-yt-limit" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-kitBox">Kit Box</Label>
                  <Input id="edit-kitBox" name="kitBox" defaultValue={selectedPackage.kitBox || ''} data-testid="input-edit-kit-box" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="edit-premiumSubscription" name="premiumSubscription" defaultChecked={selectedPackage.premiumSubscription} data-testid="checkbox-edit-premium" />
                  <Label htmlFor="edit-premiumSubscription">Premium Subscription</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="edit-onsiteVideoVisit" name="onsiteVideoVisit" defaultChecked={selectedPackage.onsiteVideoVisit} data-testid="checkbox-edit-onsite" />
                  <Label htmlFor="edit-onsiteVideoVisit">Onsite Video Visit</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="edit-pentaRefEarning" name="pentaRefEarning" defaultChecked={selectedPackage.pentaRefEarning} data-testid="checkbox-edit-penta" />
                  <Label htmlFor="edit-pentaRefEarning">Penta Ref Earning</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="edit-remoWork" name="remoWork" defaultChecked={selectedPackage.remoWork} data-testid="checkbox-edit-remo" />
                  <Label htmlFor="edit-remoWork">Remote Work</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="edit-isActive" name="isActive" defaultChecked={selectedPackage.isActive} data-testid="checkbox-edit-active" />
                  <Label htmlFor="edit-isActive">Active</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updatePackageMutation.isPending} data-testid="button-submit-edit">
                  {updatePackageMutation.isPending ? 'Updating...' : 'Update Package'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}