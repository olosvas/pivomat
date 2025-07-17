import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';
import { useCart } from '@/hooks/useCart';
import { formatPrice, formatVolume } from '@/lib/kioskUtils';
import { ShoppingCart, Plus, Minus, X } from 'lucide-react';

interface CartProps {
  onCheckout: () => void;
}

export default function Cart({ onCheckout }: CartProps) {
  const { t } = useLanguage();
  const { items, total, removeItem, updateQuantity } = useCart();

  const handleQuantityChange = (itemId: string, delta: number) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      updateQuantity(itemId, item.volume + delta);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <ShoppingCart className="mr-2 text-primary" />
        {t('your_order')}
      </h2>
      
      <div className="flex-1 overflow-y-auto mb-6">
        {items.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <ShoppingCart className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>{t('cart_empty')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <Card key={item.id} className="bg-white shadow-sm">
                <CardContent className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 text-sm">
                        {item.name}
                      </h4>
                      <p className="text-xs text-gray-600">
                        {formatVolume(item.volume)} × {formatPrice(item.pricePerLiter)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(item.id, -0.1)}
                        className="h-8 w-8 p-0 touch-target"
                        disabled={item.volume <= 0.1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-medium min-w-[3rem] text-center">
                        {formatVolume(item.volume)}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(item.id, 0.1)}
                        className="h-8 w-8 p-0 touch-target"
                        disabled={item.volume >= 1.0}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <span className="font-semibold text-gray-800">
                      {formatPrice(item.subtotal)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-between items-center text-lg font-semibold text-gray-800 mb-4">
          <span>{t('total')}:</span>
          <span>{formatPrice(total)}</span>
        </div>
        
        <Button
          onClick={onCheckout}
          disabled={items.length === 0}
          className="w-full touch-target bg-primary hover:bg-primary/90 text-white font-semibold py-4"
        >
          {t('checkout')}
        </Button>
      </div>
    </div>
  );
}
