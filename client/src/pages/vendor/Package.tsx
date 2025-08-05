import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import PaymentModal from '@/components/modals/PaymentModal';

export default function VendorPackage() {
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);

  const { data: userPackage, isLoading: packageLoading } = useQuery({
    queryKey: ['/api/user/package'],
  });

  const { data: allPackages, isLoading: packagesLoading } = useQuery({
    queryKey: ['/api/packages'],
  });

  if (packageLoading || packagesLoading) {
    return <Loading className="h-64" text="Loading package information..." />;
  }

  const packageDetails = userPackage?.packageDetails;
  const daysLeft = userPackage ? Math.ceil((new Date(userPackage.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

  const handleUpgrade = (packageInfo: any) => {
    setSelectedPackage(packageInfo);
    setPaymentModalOpen(true);
  };

  const getProgressPercentage = (used: number, total: number) => {
    return Math.min((used / total) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage < 50) return 'bg-green-600';
    if (percentage < 80) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Package Information</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Package */}
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900" data-testid="current-package-name">
                {packageDetails?.name || 'No Active Package'}
              </h3>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                Active
              </span>
            </div>
            
            {userPackage && packageDetails ? (
              <div className="space-y-4">
                {/* Tasks Used */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Tasks Used</span>
                    <span className="text-sm font-bold text-gray-900" data-testid="tasks-used">
                      {userPackage.tasksUsed}/{packageDetails.taskLimit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getProgressColor(getProgressPercentage(userPackage.tasksUsed, packageDetails.taskLimit))}`}
                      style={{ width: `${getProgressPercentage(userPackage.tasksUsed, packageDetails.taskLimit)}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Skips Used */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Skips Used</span>
                    <span className="text-sm font-bold text-gray-900" data-testid="skips-used">
                      {userPackage.skipsUsed}/{packageDetails.skipLimit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getProgressColor(getProgressPercentage(userPackage.skipsUsed, packageDetails.skipLimit))}`}
                      style={{ width: `${getProgressPercentage(userPackage.skipsUsed, packageDetails.skipLimit)}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Validity Period */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Validity Period</span>
                    <span className="text-sm font-bold text-gray-900" data-testid="validity-remaining">
                      {daysLeft} days left
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getProgressColor(100 - (daysLeft / packageDetails.validityDays) * 100)}`}
                      style={{ width: `${Math.max((daysLeft / packageDetails.validityDays) * 100, 0)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-info-circle text-blue-600"></i>
                    <div>
                      <p className="text-sm font-medium text-blue-900">Package Expires On</p>
                      <p className="text-sm text-blue-700" data-testid="expiry-date">
                        {new Date(userPackage.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-box-open text-4xl mb-4"></i>
                <p>No active package</p>
                <p className="text-sm">Purchase a package to start working on tasks</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Upgrade Options */}
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Upgrade Package</h3>
            
            <div className="space-y-4">
              {allPackages?.map((pkg: any) => (
                <Card 
                  key={pkg.id}
                  className="border border-gray-200 hover:border-primary transition-colors cursor-pointer"
                  data-testid={`package-${pkg.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900" data-testid={`package-name-${pkg.id}`}>
                        {pkg.name}
                      </h4>
                      <span className="text-lg font-bold text-primary" data-testid={`package-price-${pkg.id}`}>
                        ₹{pkg.price}
                      </span>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1 mb-4">
                      <li className="flex items-center space-x-2">
                        <i className="fas fa-check text-green-500"></i>
                        <span>{pkg.taskLimit} task uploads</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <i className="fas fa-check text-green-500"></i>
                        <span>{pkg.skipLimit} skips allowed</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <i className="fas fa-check text-green-500"></i>
                        <span>{pkg.validityDays} days validity</span>
                      </li>
                    </ul>
                    <Button
                      onClick={() => handleUpgrade(pkg)}
                      className="w-full"
                      variant={userPackage?.packageId === pkg.id ? "outline" : "default"}
                      disabled={userPackage?.packageId === pkg.id}
                      data-testid={`button-upgrade-${pkg.id}`}
                    >
                      {userPackage?.packageId === pkg.id ? 'Current Package' : 'Upgrade'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {!allPackages || allPackages.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-box text-4xl mb-4"></i>
                <p>No packages available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        package={selectedPackage}
      />
    </div>
  );
}
