import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useLanguage } from '@/hooks/useLanguage';

interface RedeemResult {
  success: boolean;
  error?: string;
  tier?: string;
  duration_months?: number | null;
}

export const useVoucher = () => {
  const [isRedeeming, setIsRedeeming] = useState(false);
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const redeemVoucher = async (code: string): Promise<RedeemResult> => {
    if (!code.trim()) {
      return { success: false, error: 'empty_code' };
    }

    setIsRedeeming(true);
    
    try {
      const { data, error } = await supabase.rpc('redeem_voucher', {
        p_code: code.trim()
      });

      if (error) {
        console.error('Voucher redemption error:', error);
        return { success: false, error: 'server_error' };
      }

      const result = data as unknown as RedeemResult;

      if (result.success) {
        // Invalidate subscription cache to reflect new tier
        queryClient.invalidateQueries({ queryKey: ['subscription'] });
        
        const tierName = result.tier === 'FOUNDER' ? 'Founder' : 'Adventurer';
        const durationText = result.duration_months 
          ? t('voucher.monthsDuration', { months: result.duration_months })
          : t('voucher.lifetime');
        
        toast.success(t('voucher.redeemSuccess'), {
          description: `${tierName} - ${durationText}`
        });
      }

      return result;
    } catch (err) {
      console.error('Voucher redemption error:', err);
      return { success: false, error: 'server_error' };
    } finally {
      setIsRedeeming(false);
    }
  };

  const getErrorMessage = (error: string): string => {
    switch (error) {
      case 'not_authenticated':
        return t('voucher.errorNotAuthenticated');
      case 'invalid_code':
        return t('voucher.errorInvalidCode');
      case 'already_used':
        return t('voucher.errorAlreadyUsed');
      case 'expired':
        return t('voucher.errorExpired');
      case 'empty_code':
        return t('voucher.errorEmptyCode');
      default:
        return t('voucher.errorGeneric');
    }
  };

  return {
    redeemVoucher,
    isRedeeming,
    getErrorMessage
  };
};
