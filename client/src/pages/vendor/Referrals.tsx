import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loading } from '@/components/ui/loading';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function VendorReferrals() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: referralStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/referrals/stats'],
  });

  const { data: userReferrals, isLoading: referralsLoading } = useQuery({
    queryKey: ['/api/referrals/mine'],
  });

  const referralUrl = `${window.location.origin}/register?ref=${user?.referralCode}`;

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const shareOnWhatsApp = () => {
    const message = `Join me on this amazing platform! Use my referral code: ${user?.referralCode}\n${referralUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`, '_blank');
  };

  if (statsLoading || referralsLoading) {
    return <Loading className="h-64" text="Loading referral data..." />;
  }

  const commissionStructure = [
    { level: 1, label: 'Direct Referrals', percentage: '10%', color: 'bg-primary text-white' },
    { level: 2, label: 'Level 2', percentage: '5%', color: 'bg-secondary text-white' },
    { level: 3, label: 'Level 3', percentage: '4%', color: 'bg-accent text-white' },
    { level: 4, label: 'Level 4', percentage: '3%', color: 'bg-purple-600 text-white' },
    { level: 5, label: 'Level 5', percentage: '2%', color: 'bg-red-600 text-white' },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Referral Program</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Referral Stats */}
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Referral Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <i className="fas fa-users text-primary"></i>
                  <span className="font-medium text-gray-900">Total Referrals</span>
                </div>
                <span className="text-lg font-bold text-primary" data-testid="total-referrals">
                  {referralStats?.totalReferrals || 0}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <i className="fas fa-rupee-sign text-secondary"></i>
                  <span className="font-medium text-gray-900">Total Earnings</span>
                </div>
                <span className="text-lg font-bold text-secondary" data-testid="total-earnings">
                  ₹{referralStats?.totalEarnings || 0}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <i className="fas fa-clock text-accent"></i>
                  <span className="font-medium text-gray-900">This Month</span>
                </div>
                <span className="text-lg font-bold text-accent" data-testid="monthly-earnings">
                  ₹{referralStats?.monthlyEarnings || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Referral Link */}
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Referral Link</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Referral Code</label>
                <div className="flex items-center space-x-2">
                  <Input 
                    type="text" 
                    value={user?.referralCode || ''} 
                    readOnly 
                    className="flex-1 bg-gray-50"
                    data-testid="referral-code"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(user?.referralCode || '', 'Referral code')}
                    data-testid="button-copy-code"
                  >
                    <i className="fas fa-copy"></i>
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Referral URL</label>
                <div className="flex items-center space-x-2">
                  <Input 
                    type="text" 
                    value={referralUrl} 
                    readOnly 
                    className="flex-1 bg-gray-50 text-sm"
                    data-testid="referral-url"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(referralUrl, 'Referral URL')}
                    data-testid="button-copy-url"
                  >
                    <i className="fas fa-copy"></i>
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Button
                  onClick={shareOnWhatsApp}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  data-testid="button-share-whatsapp"
                >
                  <i className="fab fa-whatsapp mr-2"></i>
                  WhatsApp
                </Button>
                <Button
                  onClick={shareOnFacebook}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  data-testid="button-share-facebook"
                >
                  <i className="fab fa-facebook mr-2"></i>
                  Facebook
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Commission Structure */}
      <Card className="shadow-sm border border-gray-100 mb-6">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Commission Structure</h3>
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

      {/* Recent Referrals */}
      <Card className="shadow-sm border border-gray-100">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Referrals</h3>
          <div className="space-y-4">
            {userReferrals && userReferrals.length > 0 ? (
              userReferrals.map((referral: any) => (
                <div key={referral.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg" data-testid={`referral-${referral.id}`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {referral.referredName.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900" data-testid={`referral-name-${referral.id}`}>
                        {referral.referredName}
                      </p>
                      <p className="text-sm text-gray-500">
                        Joined {new Date(referral.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-secondary" data-testid={`referral-commission-${referral.id}`}>
                      +₹{referral.commission}
                    </p>
                    <p className="text-xs text-gray-500">Level {referral.level}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-user-friends text-4xl mb-4"></i>
                <p>No referrals yet</p>
                <p className="text-sm">Share your referral link to start earning commissions</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
