export function formatPrice(amount: number): string {
  return `€${amount.toFixed(2)}`;
}

export function formatVolume(volume: number): string {
  return `${volume.toFixed(1)}L`;
}

export function generateOrderNumber(): string {
  return Math.random().toString(36).substr(2, 9).toUpperCase();
}

export function isValidVolume(volume: number): boolean {
  return volume >= 0.1 && volume <= 1.0;
}

export function calculateSubtotal(pricePerLiter: number, volume: number): number {
  return pricePerLiter * volume;
}

export function getStockLevel(currentStock: number, totalCapacity: number): 'high' | 'medium' | 'low' | 'empty' {
  if (currentStock === 0) return 'empty';
  const percentage = (currentStock / totalCapacity) * 100;
  if (percentage < 10) return 'low';
  if (percentage < 50) return 'medium';
  return 'high';
}

export function getStockLevelColor(level: 'high' | 'medium' | 'low' | 'empty'): string {
  switch (level) {
    case 'high':
      return 'text-green-600';
    case 'medium':
      return 'text-yellow-600';
    case 'low':
      return 'text-orange-600';
    case 'empty':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
}
