import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/kioskUtils';
import { Beverage } from '@shared/schema';
import { Utensils, AlertTriangle } from 'lucide-react';

const DRINK_IMAGES = {
  beer: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&h=150',
  wine: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&h=150',
  soda: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&h=150',
  juice: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&h=150'
};

export default function DrinkSelection() {
  const { language, t } = useLanguage();
  const { addItem } = useCart();

  const { data: beverages = [], isLoading, error } = useQuery({
    queryKey: ['/api/beverages'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const handleSelectDrink = (beverage: Beverage) => {
    const defaultVolume = beverage.volumeOptions[0] || 0.5;
    addItem(beverage, defaultVolume);
  };

  const getDrinkImage = (beverageId: string): string => {
    const lowerId = beverageId.toLowerCase();
    if (lowerId.includes('beer')) return DRINK_IMAGES.beer;
    if (lowerId.includes('wine')) return DRINK_IMAGES.wine;
    if (lowerId.includes('soda')) return DRINK_IMAGES.soda;
    if (lowerId.includes('juice')) return DRINK_IMAGES.juice;
    return DRINK_IMAGES.soda; // Default
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-600">Loading drinks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mb-4 mx-auto" />
          <p className="text-red-600">Failed to load drinks. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <Utensils className="mr-2 text-primary" />
        {t('select_drinks')}
      </h2>
      
      <div className="grid grid-cols-2 gap-4">
        {beverages.map((beverage: Beverage) => {
          const name = language === 'sk' ? beverage.nameSk : beverage.nameEn;
          const description = language === 'sk' ? beverage.descriptionSk : beverage.descriptionEn;
          const currentStock = parseFloat(beverage.currentStock);
          const isOutOfStock = currentStock === 0;

          return (
            <Card
              key={beverage.id}
              className={`cursor-pointer transition-all duration-200 ${
                isOutOfStock 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:border-primary hover:shadow-lg'
              }`}
            >
              <CardContent className="p-4">
                <Button
                  variant="ghost"
                  className="w-full h-auto p-0 hover:bg-transparent"
                  onClick={() => !isOutOfStock && handleSelectDrink(beverage)}
                  disabled={isOutOfStock}
                >
                  <div className="w-full text-left">
                    <img 
                      src={beverage.imageUrl || getDrinkImage(beverage.id)} 
                      alt={name}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                    <h3 className="font-semibold text-gray-800 mb-1">{name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-primary">
                        {formatPrice(parseFloat(beverage.pricePerLiter))}/L
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        beverage.requiresAgeVerification 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {beverage.requiresAgeVerification ? '21+' : t('all_ages')}
                      </span>
                    </div>
                    {isOutOfStock && (
                      <div className="mt-2 text-center">
                        <span className="text-red-600 font-medium">Out of Stock</span>
                      </div>
                    )}
                  </div>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
