import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { IdCard, Camera, Check, X, ArrowLeft, User } from 'lucide-react';

interface AgeVerificationProps {
  onVerified: () => void;
  onCancel: () => void;
}

type VerificationStep = 'consent' | 'method' | 'face' | 'id';

export default function AgeVerification({ onVerified, onCancel }: AgeVerificationProps) {
  const [step, setStep] = useState<VerificationStep>('consent');
  const [isVerifying, setIsVerifying] = useState(false);
  const { t } = useLanguage();
  const { toast } = useToast();

  const handleConsentYes = () => {
    setStep('method');
  };

  const handleFaceVerification = async () => {
    setStep('face');
    setIsVerifying(true);
    
    try {
      const response = await apiRequest('POST', '/api/verify-age/face', {});
      const result = await response.json();
      
      if (result.verified) {
        toast({
          title: "Verification Successful",
          description: "Age verification completed successfully.",
        });
        onVerified();
      } else {
        toast({
          title: "Verification Failed",
          description: t('verification_failed'),
          variant: "destructive",
        });
        setStep('method');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: t('system_error'),
        variant: "destructive",
      });
      setStep('method');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleIdVerification = async () => {
    setStep('id');
    setIsVerifying(true);
    
    try {
      const response = await apiRequest('POST', '/api/verify-age/id', {});
      const result = await response.json();
      
      if (result.verified) {
        toast({
          title: "Verification Successful",
          description: "Age verification completed successfully.",
        });
        onVerified();
      } else {
        toast({
          title: "Verification Failed",
          description: t('verification_failed'),
          variant: "destructive",
        });
        setStep('method');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: t('system_error'),
        variant: "destructive",
      });
      setStep('method');
    } finally {
      setIsVerifying(false);
    }
  };

  const simulateSuccess = () => {
    toast({
      title: "Verification Successful",
      description: "Age verification completed successfully.",
    });
    onVerified();
  };

  if (step === 'consent') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <IdCard className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {t('age_verification_required')}
          </h2>
          <p className="text-gray-600 mb-6">
            {t('must_be_21')}
          </p>
        </div>
        
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center mb-2">
              <Check className="h-5 w-5 text-amber-600 mr-2" />
              <span className="font-medium text-amber-800">
                {t('consent_required')}
              </span>
            </div>
            <p className="text-sm text-amber-700">
              {t('consent_message')}
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={handleConsentYes}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 touch-target"
          >
            <Check className="mr-2 h-5 w-5" />
            {t('yes_consent')}
          </Button>
          <Button
            onClick={onCancel}
            variant="secondary"
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-4 px-6 touch-target"
          >
            <X className="mr-2 h-5 w-5" />
            {t('no_cancel')}
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'method') {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {t('choose_verification')}
        </h2>
        
        <div className="space-y-4">
          <Button
            onClick={handleFaceVerification}
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-4 px-6 touch-target"
          >
            <Camera className="mr-3 h-6 w-6" />
            <div className="text-left">
              <div>{t('face_scan')}</div>
              <div className="text-sm opacity-90">{t('face_scan_desc')}</div>
            </div>
          </Button>
          
          <Button
            onClick={handleIdVerification}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-6 touch-target"
          >
            <IdCard className="mr-3 h-6 w-6" />
            <div className="text-left">
              <div>{t('id_card')}</div>
              <div className="text-sm opacity-90">{t('id_card_desc')}</div>
            </div>
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'face') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {t('face_verification')}
          </h2>
          <Card className="bg-gray-900 p-8 mb-4 relative">
            <CardContent className="p-0">
              <div className="w-48 h-36 bg-gray-700 rounded-lg mx-auto flex items-center justify-center relative">
                <User className="h-16 w-16 text-gray-400" />
                {isVerifying && (
                  <div className="absolute inset-0 rounded-lg border-4 border-dashed border-primary animate-pulse"></div>
                )}
              </div>
            </CardContent>
          </Card>
          <p className="text-sm text-gray-600 mb-6">
            {t('look_at_camera')}
          </p>
          <div className="flex justify-center space-x-4">
            {!isVerifying && (
              <>
                <Button
                  onClick={simulateSuccess}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 touch-target"
                >
                  <Check className="mr-2 h-5 w-5" />
                  {t('simulate_success')}
                </Button>
                <Button
                  onClick={() => setStep('method')}
                  variant="secondary"
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-6 touch-target"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  {t('back')}
                </Button>
              </>
            )}
            {isVerifying && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Verifying...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
