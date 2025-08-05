import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Package } from '@shared/schema';
import { Star, Check, Calendar, Target, Forward, Coins } from 'lucide-react';

interface PackageSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
}

export function PackageSelectionModal({ isOpen, onClose, reason }: PackageSelectionModalProps) {
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const { toast } = useToast();

  const { data: packages, isLoading } = useQuery({
    queryKey: ['/api/packages'],
    enabled: isOpen
  });

  const purchaseMutation = useMutation({
    mutationFn: async (packageId: number) => {
      return apiRequest('/api/payments/create-order', { packageId });
    },
    onSuccess: (response: any) => {
      // Redirect to payment gateway
      if (response.data?.paymentUrl) {
        window.location.href = response.data.paymentUrl;
      } else {
        toast({
          title: 'Success',
          description: 'Package purchased successfully!',
        });
        queryClient.invalidateQueries({ queryKey: ['/api/user/package'] });
        onClose();
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Purchase Failed',
        description: error.message || 'Failed to purchase package. Please try again.',
        variant: 'destructive'
      });
    }
  });

  const handlePurchase = () => {
    if (!selectedPackage) {
      toast({
        title: 'No Package Selected',
        description: 'Please select a package to continue.',
        variant: 'destructive'
      });
      return;
    }
    purchaseMutation.mutate(selectedPackage);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getPackageTypeColor = (type: string) => {
    return type === 'Onsite' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Choose Your Stars Flock Package
          </DialogTitle>
          <DialogDescription>
            {reason || 'Your current limits have been exceeded. Select a package to continue working on tasks.'}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading packages...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Package Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.isArray(packages) && packages.map((pkg: Package) => (
                <Card 
                  key={pkg.id} 
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    selectedPackage === pkg.id 
                      ? 'ring-2 ring-primary shadow-lg' 
                      : 'hover:ring-1 hover:ring-gray-300'
                  }`}
                  onClick={() => setSelectedPackage(pkg.id)}
                  data-testid={`package-card-${pkg.id}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{pkg.name}</CardTitle>
                      <Badge variant="secondary" className={getPackageTypeColor(pkg.type)}>
                        {pkg.type}
                      </Badge>
                    </div>
                    <CardDescription className="text-2xl font-bold text-primary">
                      {formatCurrency(pkg.price)}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    {/* Key Features */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-green-600" />
                        <span>{pkg.taskLimit} Tasks</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Forward className="h-4 w-4 text-yellow-600" />
                        <span>{pkg.skipLimit} Skips</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span>{pkg.validityDays} Days</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Coins className="h-4 w-4 text-orange-600" />
                        <span>₹{pkg.soloEarn}/task</span>
                      </div>
                    </div>

                    <Separator />

                    {/* Additional Benefits */}
                    <div className="space-y-1 text-xs text-gray-600">
                      {pkg.dailyTaskLimit > 0 && (
                        <div className="flex items-center gap-2">
                          <Check className="h-3 w-3 text-green-500" />
                          <span>Daily limit: {pkg.dailyTaskLimit} tasks</span>
                        </div>
                      )}
                      {pkg.earnTask > 0 && (
                        <div className="flex items-center gap-2">
                          <Check className="h-3 w-3 text-green-500" />
                          <span>Earn tasks: ₹{pkg.earnTask}</span>
                        </div>
                      )}
                      {pkg.dualEarn > 0 && (
                        <div className="flex items-center gap-2">
                          <Check className="h-3 w-3 text-green-500" />
                          <span>Dual earn: ₹{pkg.dualEarn}</span>
                        </div>
                      )}
                      {pkg.premiumSubscription && (
                        <div className="flex items-center gap-2">
                          <Check className="h-3 w-3 text-green-500" />
                          <span>Premium subscription included</span>
                        </div>
                      )}
                      {pkg.kitBox && (
                        <div className="flex items-center gap-2">
                          <Check className="h-3 w-3 text-green-500" />
                          <span>Kit box included</span>
                        </div>
                      )}
                    </div>

                    {/* Selection Indicator */}
                    {selectedPackage === pkg.id && (
                      <div className="flex items-center justify-center pt-2">
                        <div className="flex items-center gap-2 text-primary">
                          <Check className="h-4 w-4" />
                          <span className="text-sm font-medium">Selected</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={onClose}
                disabled={purchaseMutation.isPending}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button 
                onClick={handlePurchase}
                disabled={!selectedPackage || purchaseMutation.isPending}
                className="min-w-32"
                data-testid="button-purchase"
              >
                {purchaseMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </div>
                ) : (
                  'Purchase Package'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}