import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { formatPrice } from '@/lib/kioskUtils';
import { CreditCard, Banknote, ArrowLeft } from 'lucide-react';

interface PaymentProps {
  total: number;
  onPaymentComplete: () => void;
  onCancel: () => void;
}

export default function Payment({ total, onPaymentComplete, onCancel }: PaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { t } = useLanguage();

  const handlePayment = (method: 'card' | 'cash') => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentComplete();
    }, 2000);
  };

  if (isProcessing) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mb-4 mx-auto"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Processing Payment</h2>
          <p className="text-gray-600">Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <CreditCard className="h-16 w-16 text-primary mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          {t('payment')}
        </h2>
        <p className="text-gray-600 mb-2">
          {t('choose_payment')}
        </p>
        <div className="text-2xl font-bold text-primary mb-6">
          {formatPrice(total)}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Button
          onClick={() => handlePayment('card')}
          className="bg-primary hover:bg-primary/90 text-white font-semibold py-8 px-6 touch-target flex flex-col items-center space-y-2"
        >
          <CreditCard className="h-8 w-8" />
          <span>{t('card_payment')}</span>
        </Button>
        
        <Button
          onClick={() => handlePayment('cash')}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-8 px-6 touch-target flex flex-col items-center space-y-2"
        >
          <Banknote className="h-8 w-8" />
          <span>{t('cash_payment')}</span>
        </Button>
      </div>
      
      <div className="flex justify-center">
        <Button
          onClick={onCancel}
          variant="secondary"
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-6 touch-target"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          {t('back')}
        </Button>
      </div>
    </div>
  );
}
