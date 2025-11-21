import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Shield, CheckCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PaymentGateway = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const paymentId = searchParams.get('paymentId');
  const amount = searchParams.get('amount');
  const artworkTitle = searchParams.get('artworkTitle');

  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardHolderName: '',
    paymentMethod: 'credit_card'
  });
  const [processing, setProcessing] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const handlePayment = async () => {
    if (!paymentId) {
      toast({
        title: "Error",
        description: "Invalid payment session",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/payments/complete/${paymentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          transactionId: `TXN_${Date.now()}`,
          paymentMethod: paymentData.paymentMethod,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Payment Successful",
          description: "Your payment has been processed successfully!",
        });
        // Redirect back to dashboard
        navigate('/dashboard/user');
      } else {
        toast({
          title: "Payment Failed",
          description: data.message || "Payment processing failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: "Network error occurred",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectPayment = async () => {
    if (!paymentId) {
      toast({
        title: "Error",
        description: "Invalid payment session",
        variant: "destructive",
      });
      return;
    }

    setRejecting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/payments/reject/${paymentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Payment Rejected",
          description: "Payment has been rejected. Auction may be reassigned.",
        });
        // Redirect back to dashboard
        navigate('/dashboard/user');
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to reject payment",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Reject payment error:', error);
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      });
    } finally {
      setRejecting(false);
    }
  };

  if (!paymentId || !amount || !artworkTitle) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Payment Session</h1>
          <p>Please return to your dashboard and try again.</p>
          <Button onClick={() => navigate('/dashboard/user')} className="mt-4">
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
          Secure Payment Gateway
        </h1>
        <p className="text-muted-foreground">Complete your auction payment securely</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Payment Details</span>
          </CardTitle>
          <CardDescription>
            Artwork: {artworkTitle}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg mb-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Amount:</span>
              <span className="text-2xl font-bold text-primary">₹{amount}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-green-600" />
            <span>Payment Information</span>
          </CardTitle>
          <CardDescription>
            Your payment information is encrypted and secure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select
              value={paymentData.paymentMethod}
              onValueChange={(value) => setPaymentData(prev => ({ ...prev, paymentMethod: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit_card">Credit Card</SelectItem>
                <SelectItem value="debit_card">Debit Card</SelectItem>
                <SelectItem value="net_banking">Net Banking</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(paymentData.paymentMethod === 'credit_card' || paymentData.paymentMethod === 'debit_card') && (
            <>
              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={paymentData.cardNumber}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, cardNumber: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="expiryMonth">Month</Label>
                  <Select
                    value={paymentData.expiryMonth}
                    onValueChange={(value) => setPaymentData(prev => ({ ...prev, expiryMonth: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="MM" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i + 1} value={String(i + 1).padStart(2, '0')}>
                          {String(i + 1).padStart(2, '0')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="expiryYear">Year</Label>
                  <Select
                    value={paymentData.expiryYear}
                    onValueChange={(value) => setPaymentData(prev => ({ ...prev, expiryYear: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="YYYY" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => (
                        <SelectItem key={i} value={String(new Date().getFullYear() + i)}>
                          {new Date().getFullYear() + i}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    value={paymentData.cvv}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, cvv: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="cardHolderName">Card Holder Name</Label>
                <Input
                  id="cardHolderName"
                  placeholder="John Doe"
                  value={paymentData.cardHolderName}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, cardHolderName: e.target.value }))}
                />
              </div>
            </>
          )}

          <div className="flex space-x-4 pt-4">
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard/user')}
              className="flex-1"
              disabled={processing || rejecting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectPayment}
              className="flex-1"
              disabled={processing || rejecting}
            >
              {rejecting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Rejecting...
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Reject Payment
                </>
              )}
            </Button>
            <Button
              onClick={handlePayment}
              className="flex-1 bg-gradient-primary"
              disabled={processing || rejecting}
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Pay ₹{amount}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground mt-4">
        <Shield className="h-4 w-4 inline mr-1" />
        Your payment is secured with 256-bit SSL encryption
      </div>
    </div>
  );
};

export default PaymentGateway;