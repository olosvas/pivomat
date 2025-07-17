import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';
import { useCart, CartItem } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { formatVolume } from '@/lib/kioskUtils';
import { Droplet, Info } from 'lucide-react';

interface DispensingProps {
  items: CartItem[];
  onComplete: () => void;
}

interface DispensingItem extends CartItem {
  status: 'pending' | 'dispensing' | 'completed';
  progress: number;
}

export default function Dispensing({ items, onComplete }: DispensingProps) {
  const [dispensingItems, setDispensingItems] = useState<DispensingItem[]>([]);
  const [orderId, setOrderId] = useState<number | null>(null);
  const { t } = useLanguage();
  const { clearCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    // Initialize dispensing items
    const initialItems = items.map(item => ({
      ...item,
      status: 'pending' as const,
      progress: 0
    }));
    setDispensingItems(initialItems);
    
    // Create order and start dispensing
    startDispensing();
  }, [items]);

  const startDispensing = async () => {
    try {
      // Create order
      const orderResponse = await apiRequest('POST', '/api/orders', {
        items: items.map(item => ({
          beverageId: item.beverageId,
          name: item.name,
          volume: item.volume,
          pricePerLiter: item.pricePerLiter,
          subtotal: item.subtotal
        })),
        language: 'en', // This would come from useLanguage
        paymentMethod: 'card' // This would come from payment selection
      });
      
      const orderData = await orderResponse.json();
      setOrderId(orderData.orderId);
      
      // Start processing order
      await processOrder(orderData.orderId);
      
    } catch (error) {
      toast({
        title: "Error",
        description: t('system_error'),
        variant: "destructive",
      });
      onComplete();
    }
  };

  const processOrder = async (orderId: number) => {
    try {
      // Process each item sequentially
      for (let i = 0; i < dispensingItems.length; i++) {
        await dispenseItem(i);
      }
      
      // Process the order on the server
      await apiRequest('POST', `/api/orders/${orderId}/process`, {});
      
      // Complete the order
      setTimeout(() => {
        toast({
          title: "Order Complete",
          description: t('order_completed'),
        });
        clearCart();
        onComplete();
      }, 1000);
      
    } catch (error) {
      toast({
        title: "Error",
        description: t('system_error'),
        variant: "destructive",
      });
      onComplete();
    }
  };

  const dispenseItem = async (itemIndex: number) => {
    return new Promise<void>((resolve) => {
      // Update status to dispensing
      setDispensingItems(prev => 
        prev.map((item, index) => 
          index === itemIndex 
            ? { ...item, status: 'dispensing', progress: 0 }
            : item
        )
      );
      
      // Simulate dispensing progress
      const interval = setInterval(() => {
        setDispensingItems(prev => {
          const newItems = [...prev];
          const item = newItems[itemIndex];
          
          if (item.progress < 100) {
            item.progress += 10;
          } else {
            item.status = 'completed';
            clearInterval(interval);
            resolve();
          }
          
          return newItems;
        });
      }, 300);
    });
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-200';
      case 'dispensing':
        return 'bg-primary';
      case 'completed':
        return 'bg-green-500';
      default:
        return 'bg-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          {t('dispensing_order')}
        </h2>
        
        <Card className="bg-gray-50 p-6 mb-6">
          <CardContent className="p-0">
            <div className="flex items-center justify-center mb-4">
              <Droplet className="h-16 w-16 text-primary dispensing-animation" />
            </div>
            <div className="space-y-4">
              {dispensingItems.map((item, index) => (
                <div key={item.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-800">
                      {item.name} ({formatVolume(item.volume)})
                    </span>
                    <span className={`text-sm font-semibold ${
                      item.status === 'completed' ? 'text-green-600' : 
                      item.status === 'dispensing' ? 'text-primary' : 'text-gray-500'
                    }`}>
                      {item.status === 'completed' ? '100%' : 
                       item.status === 'dispensing' ? `${item.progress}%` : 'Pending'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(item.status)}`}
                      style={{ width: `${item.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-center text-blue-800">
              <Info className="h-5 w-5 mr-2" />
              <span className="font-medium">
                {t('collect_drink')}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
