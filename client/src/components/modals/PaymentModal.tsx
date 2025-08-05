import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  package: any;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PaymentModal({ isOpen, onClose, package: packageInfo }: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createOrderMutation = useMutation({
    mutationFn: async (packageId: number) => {
      return apiRequest('POST', '/api/payments/create-order', { packageId });
    },
  });

  const verifyPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      return apiRequest('POST', '/api/payments/verify', paymentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/package'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/limits'] });
      toast({
        title: "Success",
        description: "Payment successful! Your package has been activated.",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Payment verification failed",
        variant: "destructive",
      });
    },
  });

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    try {
      setIsProcessing(true);

      // Load Razorpay script
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        toast({
          title: "Error",
          description: "Failed to load payment gateway",
          variant: "destructive",
        });
        return;
      }

      // Create order
      const orderResponse = await createOrderMutation.mutateAsync(packageInfo.id);
      const orderData = await orderResponse.json();

      // Configure Razorpay options
      const options = {
        key: orderData.data.key,
        amount: orderData.data.amount,
        currency: orderData.data.currency,
        name: 'Vendor Task Management',
        description: `Purchase ${packageInfo.name}`,
        order_id: orderData.data.orderId,
        handler: async (response: any) => {
          try {
            await verifyPaymentMutation.mutateAsync({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
          } catch (error) {
            console.error('Payment verification failed:', error);
          }
        },
        prefill: {
          name: 'User',
          email: 'user@example.com',
        },
        theme: {
          color: '#3B82F6',
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
      };

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to initiate payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" data-testid="modal-payment">
        <DialogHeader>
          <DialogTitle>Package Upgrade</DialogTitle>
        </DialogHeader>
        
        {packageInfo && (
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2" data-testid="payment-package-name">
                {packageInfo.name}
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-center space-x-2">
                  <i className="fas fa-check text-green-500"></i>
                  <span>{packageInfo.taskLimit} task uploads</span>
                </li>
                <li className="flex items-center space-x-2">
                  <i className="fas fa-check text-green-500"></i>
                  <span>{packageInfo.skipLimit} skips allowed</span>
                </li>
                <li className="flex items-center space-x-2">
                  <i className="fas fa-check text-green-500"></i>
                  <span>{packageInfo.validityDays} days validity</span>
                </li>
              </ul>
              <div className="mt-3 pt-3 border-t border-blue-200">
                <p className="text-lg font-bold text-primary" data-testid="payment-package-price">
                  ₹{packageInfo.price}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                onClick={handlePayment}
                disabled={isProcessing || createOrderMutation.isPending || verifyPaymentMutation.isPending}
                className="flex-1 bg-primary text-white hover:bg-blue-700"
                data-testid="button-pay-now"
              >
                {isProcessing || createOrderMutation.isPending || verifyPaymentMutation.isPending ? (
                  <Loading size="sm" />
                ) : (
                  <>
                    <i className="fas fa-credit-card mr-2"></i>
                    Pay Now
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
                data-testid="button-cancel"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
