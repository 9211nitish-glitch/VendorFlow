import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Wallet as WalletIcon, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Calendar,
  IndianRupee,
  TrendingUp,
  Download
} from 'lucide-react';
import { format } from 'date-fns';

interface WalletTransaction {
  id: number;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  status: string;
  createdAt: string;
  taskId?: number;
}

interface WalletData {
  balance: number;
  transactions: WalletTransaction[];
  pagination: {
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

export default function Wallet() {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: walletData, isLoading } = useQuery<WalletData>({
    queryKey: ['/api/wallet/transactions'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const { data: balanceData } = useQuery<{ balance: number }>({
    queryKey: ['/api/wallet/balance'],
    refetchInterval: 30000
  });

  const withdrawMutation = useMutation({
    mutationFn: (amount: number) => apiRequest('/api/wallet/withdraw', {
      method: 'POST',
      body: JSON.stringify({ amount })
    }),
    onSuccess: () => {
      toast({
        title: "Withdrawal Requested",
        description: "Your withdrawal request has been submitted successfully. It will be processed within 24-48 hours.",
      });
      setWithdrawAmount('');
      setIsWithdrawing(false);
      queryClient.invalidateQueries({ queryKey: ['/api/wallet/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet/balance'] });
    },
    onError: (error: any) => {
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Failed to process withdrawal request",
        variant: "destructive",
      });
    }
  });

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive",
      });
      return;
    }

    if (amount < 100) {
      toast({
        title: "Minimum Amount",
        description: "Minimum withdrawal amount is ₹100",
        variant: "destructive",
      });
      return;
    }

    if (amount > (balanceData?.balance || 0)) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance for this withdrawal",
        variant: "destructive",
      });
      return;
    }

    withdrawMutation.mutate(amount);
  };

  const balance = Number(balanceData?.balance || walletData?.balance || 0);
  const transactions = walletData?.transactions || [];

  // Calculate statistics
  const totalEarnings = transactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);

  const thisMonthEarnings = transactions
    .filter(t => {
      const transactionDate = new Date(t.createdAt);
      const now = new Date();
      return t.type === 'credit' && 
        transactionDate.getMonth() === now.getMonth() && 
        transactionDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, t) => sum + t.amount, 0);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" data-testid="wallet-page">
      {/* Wallet Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <WalletIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="wallet-balance">
              ₹{balance.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Available for withdrawal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="total-earnings">
              ₹{totalEarnings.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Lifetime earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="monthly-earnings">
              ₹{thisMonthEarnings.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Current month earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="tasks-completed">
              {transactions.filter(t => t.type === 'credit' && t.taskId).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Earning tasks completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Withdrawal Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Withdraw Money
          </CardTitle>
          <CardDescription>
            Minimum withdrawal amount is ₹100. Withdrawals are processed within 24-48 hours.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isWithdrawing ? (
            <Button 
              onClick={() => setIsWithdrawing(true)}
              disabled={balance < 100}
              data-testid="button-withdraw"
            >
              <Download className="h-4 w-4 mr-2" />
              Request Withdrawal
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="amount">Withdrawal Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  min="100"
                  max={balance}
                  data-testid="input-withdraw-amount"
                />
                <p className="text-sm text-muted-foreground">
                  Available balance: ₹{balance.toFixed(2)}
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleWithdraw}
                  disabled={withdrawMutation.isPending}
                  data-testid="button-submit-withdrawal"
                >
                  {withdrawMutation.isPending ? 'Processing...' : 'Submit Request'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsWithdrawing(false);
                    setWithdrawAmount('');
                  }}
                  data-testid="button-cancel-withdrawal"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            Your recent wallet transactions and earnings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No transactions yet. Complete tasks to start earning!
              </div>
            ) : (
              transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      transaction.type === 'credit' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {transaction.type === 'credit' ? (
                        <ArrowDownLeft className="h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium" data-testid={`transaction-description-${transaction.id}`}>
                        {transaction.description}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(transaction.createdAt), 'MMM dd, yyyy - hh:mm a')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`} data-testid={`transaction-amount-${transaction.id}`}>
                      {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                    </p>
                    <Badge 
                      variant={transaction.status === 'completed' ? 'default' : 'secondary'}
                      data-testid={`transaction-status-${transaction.id}`}
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}