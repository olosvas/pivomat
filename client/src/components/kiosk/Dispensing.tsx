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
  cupsNeeded: number;
  currentCup: number;
}

export default function Dispensing({ items, onComplete }: DispensingProps) {
  const [dispensingItems, setDispensingItems] = useState<DispensingItem[]>([]);
  const [orderId, setOrderId] = useState<number | null>(null);
  const { t } = useLanguage();
  const { clearCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    // Initialize dispensing items with cup calculations
    const initialItems = items.map(item => ({
      ...item,
      status: 'pending' as const,
      progress: 0,
      cupsNeeded: Math.ceil(item.volume / 0.5), // Max 0.5L per cup
      currentCup: 0
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
      const item = dispensingItems[itemIndex];
      
      // Update status to dispensing
      setDispensingItems(prev => 
        prev.map((dispItem, index) => 
          index === itemIndex 
            ? { ...dispItem, status: 'dispensing', progress: 0, currentCup: 1 }
            : dispItem
        )
      );
      
      let currentCup = 1;
      
      const processNextCup = () => {
        // Update current cup
        setDispensingItems(prev => 
          prev.map((dispItem, index) => 
            index === itemIndex 
              ? { ...dispItem, currentCup }
              : dispItem
          )
        );
        
        // Simulate cup placement wait and dispensing
        const cupProgress = ((currentCup - 1) / item.cupsNeeded) * 100;
        const nextCupProgress = (currentCup / item.cupsNeeded) * 100;
        let progress = cupProgress;
        
        const interval = setInterval(() => {
          progress += 5;
          
          setDispensingItems(prev => 
            prev.map((dispItem, index) => 
              index === itemIndex 
                ? { ...dispItem, progress: Math.min(progress, nextCupProgress) }
                : dispItem
            )
          );
          
          if (progress >= nextCupProgress) {
            clearInterval(interval);
            
            if (currentCup < item.cupsNeeded) {
              currentCup++;
              setTimeout(processNextCup, 1000); // Wait between cups
            } else {
              // Complete dispensing
              setDispensingItems(prev => 
                prev.map((dispItem, index) => 
                  index === itemIndex 
                    ? { ...dispItem, status: 'completed', progress: 100 }
                    : dispItem
                )
              );
              resolve();
            }
          }
        }, 200);
      };
      
      processNextCup();
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
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <span className="font-medium text-gray-800">
                        {item.name} ({formatVolume(item.volume)})
                      </span>
                      {item.cupsNeeded > 1 && (
                        <div className="text-xs text-orange-600 mt-1">
                          Requires {item.cupsNeeded} cups
                        </div>
                      )}
                      {item.status === 'dispensing' && item.cupsNeeded > 1 && (
                        <div className="text-xs text-blue-600 mt-1">
                          Dispensing cup {item.currentCup} of {item.cupsNeeded}
                        </div>
                      )}
                    </div>
                    <span className={`text-sm font-semibold ${
                      item.status === 'completed' ? 'text-green-600' : 
                      item.status === 'dispensing' ? 'text-primary' : 'text-gray-500'
                    }`}>
                      {item.status === 'completed' ? '100%' : 
                       item.status === 'dispensing' ? `${Math.round(item.progress)}%` : 'Pending'}
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
