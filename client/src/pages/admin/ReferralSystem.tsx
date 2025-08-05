import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';

export default function ReferralSystem() {
  const { data: referralStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/referrals/stats'],
  });

  const { data: topReferrers, isLoading: referrersLoading } = useQuery({
    queryKey: ['/api/referrals/top'],
  });

  if (statsLoading || referrersLoading) {
    return <Loading className="h-64" text="Loading referral data..." />;
  }

  const commissionStructure = [
    { level: 1, label: 'Level 1', percentage: '10%', color: 'bg-primary text-white' },
    { level: 2, label: 'Level 2', percentage: '5%', color: 'bg-secondary text-white' },
    { level: 3, label: 'Level 3', percentage: '4%', color: 'bg-accent text-white' },
    { level: 4, label: 'Level 4', percentage: '3%', color: 'bg-purple-600 text-white' },
    { level: 5, label: 'Level 5', percentage: '2%', color: 'bg-red-600 text-white' },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Referral System Overview</h2>
      
      {/* Referral Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Referrals</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="stat-total-referrals">
                  {referralStats?.totalReferrals || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-network-wired text-purple-600 text-xl"></i>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Referrers</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="stat-active-referrers">
                  {referralStats?.activeReferrers || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-users text-secondary text-xl"></i>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Payouts</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="stat-total-payouts">
                  ₹{referralStats?.totalPayouts || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-rupee-sign text-accent text-xl"></i>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Commission Structure */}
      <Card className="shadow-sm border border-gray-100 mb-6">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Referral Commission Structure</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {commissionStructure.map((level) => (
              <div key={level.level} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`w-12 h-12 ${level.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                  <span className="font-bold">L{level.level}</span>
                </div>
                <p className="text-sm font-medium text-gray-900">{level.label}</p>
                <p className="text-lg font-bold text-primary">{level.percentage}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Referrers */}
      <Card className="shadow-sm border border-gray-100">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Referrers</h3>
          <div className="space-y-4">
            {topReferrers && topReferrers.length > 0 ? (
              topReferrers.map((referrer: any, index: number) => (
                <div key={referrer.userId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg" data-testid={`referrer-${referrer.userId}`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                      #{index + 1}
                    </div>
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {referrer.name.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900" data-testid={`referrer-name-${referrer.userId}`}>
                        {referrer.name}
                      </p>
                      <p className="text-sm text-gray-500">ID: {referrer.userId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900" data-testid={`referrer-count-${referrer.userId}`}>
                      {referrer.totalReferrals} referrals
                    </p>
                    <p className="text-sm text-green-600" data-testid={`referrer-earnings-${referrer.userId}`}>
                      ₹{referrer.totalEarnings} earned
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-network-wired text-4xl mb-4"></i>
                <p>No referrers found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
