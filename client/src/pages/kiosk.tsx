import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';
import { useCart } from '@/hooks/useCart';
import { Link } from 'wouter';
import { Settings, Wifi } from 'lucide-react';
import DrinkSelection from '@/components/kiosk/DrinkSelection';
import Cart from '@/components/kiosk/Cart';
import AgeVerification from '@/components/kiosk/AgeVerification';
import Payment from '@/components/kiosk/Payment';
import Dispensing from '@/components/kiosk/Dispensing';
import LanguageToggle from '@/components/kiosk/LanguageToggle';

type KioskScreen = 'drinks' | 'age-verification' | 'payment' | 'dispensing';

export default function KioskPage() {
  const [currentScreen, setCurrentScreen] = useState<KioskScreen>('drinks');
  const { language, t } = useLanguage();
  const { items, total, requiresAgeVerification } = useCart();

  const handleCheckout = () => {
    if (requiresAgeVerification) {
      setCurrentScreen('age-verification');
    } else {
      setCurrentScreen('payment');
    }
  };

  const handleAgeVerified = () => {
    setCurrentScreen('payment');
  };

  const handlePaymentComplete = () => {
    setCurrentScreen('dispensing');
  };

  const handleOrderComplete = () => {
    setCurrentScreen('drinks');
  };

  const handleBackToDrinks = () => {
    setCurrentScreen('drinks');
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="kiosk-viewport bg-white rounded-xl shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-blue-600 text-white p-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="text-2xl">🍺</div>
            <h1 className="text-xl font-bold">{t('smart_beverage_kiosk')}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full pulse-slow"></div>
              <span className="text-sm">{t('system_online')}</span>
            </div>
            <LanguageToggle />
            <Link href="/admin">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex h-full">
          {/* Left Panel - Main Content */}
          <div className="flex-1 p-4 overflow-y-auto" style={{ height: '536px' }}>
            {currentScreen === 'drinks' && (
              <DrinkSelection />
            )}
            {currentScreen === 'age-verification' && (
              <AgeVerification
                onVerified={handleAgeVerified}
                onCancel={handleBackToDrinks}
              />
            )}
            {currentScreen === 'payment' && (
              <Payment
                total={total}
                onPaymentComplete={handlePaymentComplete}
                onCancel={handleBackToDrinks}
              />
            )}
            {currentScreen === 'dispensing' && (
              <Dispensing
                items={items}
                onComplete={handleOrderComplete}
              />
            )}
          </div>

          {/* Right Panel - Cart */}
          <div className="w-80 bg-gray-50 border-l border-gray-200 p-4" style={{ height: '536px' }}>
            <Cart onCheckout={handleCheckout} />
          </div>
        </div>
      </div>
    </div>
  );
}
