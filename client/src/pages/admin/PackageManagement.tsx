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
import { Plus, Edit, Trash2, DollarSign, Clock, Users, Package2, Star, Shield, Zap, Globe, Video, CheckCircle, XCircle } from 'lucide-react';
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
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg animate-pulse"></div>
            <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-32 bg-primary/20 rounded-lg animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4 animate-pulse">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="flex space-x-1">
                  <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
              <div className="space-y-3">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="flex justify-between">
                    <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 -m-6 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Package Management
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">Create, edit, and manage your Stars Flock subscription packages</p>
          </div>
          
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105" 
                data-testid="button-create-package"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create New Package
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {packages?.map((pkg) => (
            <Card 
              key={pkg.id} 
              className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg overflow-hidden" 
              data-testid={`card-package-${pkg.id}`}
            >
              {/* Package Header with Gradient */}
              <div className={`h-2 ${pkg.type === 'onsite' 
                ? 'bg-gradient-to-r from-orange-400 to-red-500' 
                : 'bg-gradient-to-r from-blue-400 to-indigo-500'
              }`}></div>
              
              <CardHeader className="pb-3 relative">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Package2 className={`h-5 w-5 ${pkg.type === 'onsite' ? 'text-orange-500' : 'text-blue-500'}`} />
                      <CardTitle className="text-xl font-bold" data-testid={`text-package-name-${pkg.id}`}>
                        {pkg.name}
                      </CardTitle>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={pkg.type === 'onsite' ? 'default' : 'secondary'}
                        className={pkg.type === 'onsite' 
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' 
                          : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                        }
                      >
                        {pkg.type === 'onsite' ? 'ONSITE' : 'ONLINE'}
                      </Badge>
                      {!pkg.isActive && (
                        <Badge variant="destructive" className="animate-pulse">
                          <XCircle className="h-3 w-3 mr-1" />
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-8 w-8 p-0 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                      onClick={() => openEditDialog(pkg)}
                      data-testid={`button-edit-${pkg.id}`}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-300 transition-colors text-red-600"
                      onClick={() => handleDeletePackage(pkg.id)}
                      data-testid={`button-delete-${pkg.id}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Price Section */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg p-3 border border-green-200 dark:border-green-700">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-sm font-medium text-green-700 dark:text-green-400">
                      <DollarSign className="h-4 w-4 mr-1" />
                      Price
                    </span>
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid={`text-price-${pkg.id}`}>
                      ₹{Number(pkg.price).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 text-center border border-blue-200 dark:border-blue-700">
                    <Users className="h-4 w-4 mx-auto mb-1 text-blue-600 dark:text-blue-400" />
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400" data-testid={`text-task-limit-${pkg.id}`}>
                      {pkg.taskLimit}
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400">Tasks</div>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-3 text-center border border-purple-200 dark:border-purple-700">
                    <Clock className="h-4 w-4 mx-auto mb-1 text-purple-600 dark:text-purple-400" />
                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400" data-testid={`text-validity-${pkg.id}`}>
                      {pkg.validityDays}
                    </div>
                    <div className="text-xs text-purple-600 dark:text-purple-400">Days</div>
                  </div>
                </div>

                {/* Earnings Section */}
                {(pkg.soloEarn > 0 || pkg.dualEarn > 0 || pkg.earnTask > 0) && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400 flex items-center">
                      <Star className="h-4 w-4 mr-1" />
                      Earnings
                    </h4>
                    <div className="space-y-1">
                      {pkg.soloEarn > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Solo Earn</span>
                          <span className="font-medium text-yellow-600 dark:text-yellow-400">₹{pkg.soloEarn}</span>
                        </div>
                      )}
                      {pkg.dualEarn > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Dual Earn</span>
                          <span className="font-medium text-yellow-600 dark:text-yellow-400">₹{pkg.dualEarn}</span>
                        </div>
                      )}
                      {pkg.earnTask > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Earn Task</span>
                          <span className="font-medium text-yellow-600 dark:text-yellow-400">₹{pkg.earnTask}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Social Media Requirements */}
                {(pkg.igLimitMin !== '0' || pkg.ytLimitMin !== '0') && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400 flex items-center">
                      <Globe className="h-4 w-4 mr-1" />
                      Social Requirements
                    </h4>
                    <div className="space-y-1">
                      {pkg.igLimitMin !== '0' && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Instagram</span>
                          <Badge variant="outline" className="text-xs">{pkg.igLimitMin}</Badge>
                        </div>
                      )}
                      {pkg.ytLimitMin !== '0' && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">YouTube</span>
                          <Badge variant="outline" className="text-xs">{pkg.ytLimitMin}</Badge>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Kit Box */}
                {pkg.kitBox && (
                  <div className="bg-amber-50 dark:bg-amber-900/30 rounded-lg p-3 border border-amber-200 dark:border-amber-700">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center text-sm font-medium text-amber-700 dark:text-amber-400">
                        <Shield className="h-4 w-4 mr-1" />
                        Kit Box
                      </span>
                      <Badge className="bg-gradient-to-r from-amber-400 to-orange-400 text-white">
                        {pkg.kitBox}
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Features */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400 flex items-center">
                    <Zap className="h-4 w-4 mr-1" />
                    Features
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {pkg.premiumSubscription && (
                      <Badge variant="secondary" className="text-xs bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 text-purple-700 dark:text-purple-300">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                    {pkg.onsiteVideoVisit && (
                      <Badge variant="secondary" className="text-xs bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 text-blue-700 dark:text-blue-300">
                        <Video className="h-3 w-3 mr-1" />
                        Onsite Video
                      </Badge>
                    )}
                    {pkg.pentaRefEarning && (
                      <Badge variant="secondary" className="text-xs bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 text-green-700 dark:text-green-300">
                        <Star className="h-3 w-3 mr-1" />
                        Penta Ref
                      </Badge>
                    )}
                    {pkg.remoWork && (
                      <Badge variant="secondary" className="text-xs bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 text-indigo-700 dark:text-indigo-300">
                        <Globe className="h-3 w-3 mr-1" />
                        Remote Work
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
              
              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
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
    </div>
  );
}