import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Coffee } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface CupWarningProps {
  cupsNeeded: number;
  isVisible: boolean;
}

export default function CupWarning({ cupsNeeded, isVisible }: CupWarningProps) {
  const { t } = useLanguage();

  if (!isVisible) return null;

  return (
    <Alert className="border-orange-200 bg-orange-50 text-orange-800 mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center gap-2">
        <Coffee className="h-4 w-4" />
        <span className="font-medium">
          {cupsNeeded > 1 
            ? `This order requires ${cupsNeeded} cups to fulfill the volume requested.`
            : 'This order requires 1 cup.'
          }
        </span>
      </AlertDescription>
    </Alert>
  );
}