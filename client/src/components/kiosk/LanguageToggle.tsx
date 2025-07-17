import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { Languages } from 'lucide-react';

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'sk' : 'en');
  };

  return (
    <Button
      variant="ghost"
      onClick={toggleLanguage}
      className="bg-white/20 hover:bg-white/30 text-white touch-target"
    >
      <Languages className="h-4 w-4 mr-2" />
      {language.toUpperCase()}
    </Button>
  );
}
