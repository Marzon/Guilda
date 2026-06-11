import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useVoucher } from '@/hooks/useVoucher';
import { useLanguage } from '@/hooks/useLanguage';
import { Ticket, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export const VoucherRedemption = () => {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { redeemVoucher, isRedeeming, getErrorMessage } = useVoucher();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      toast.error(getErrorMessage('empty_code'));
      return;
    }

    const result = await redeemVoucher(code);
    
    if (result.success) {
      setStatus('success');
      setCode('');
      // Reset status after 3 seconds
      setTimeout(() => setStatus('idle'), 3000);
    } else {
      setStatus('error');
      toast.error(getErrorMessage(result.error || 'server_error'));
      // Reset status after 3 seconds
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-purple-100">
          <Ticket className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900">{t('voucher.title')}</h3>
          <p className="text-sm text-slate-500">{t('voucher.description')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder={t('voucher.placeholder')}
            className={`uppercase tracking-wider font-mono ${
              status === 'success' ? 'border-green-500 bg-green-50' :
              status === 'error' ? 'border-red-500 bg-red-50' : ''
            }`}
            disabled={isRedeeming}
            maxLength={20}
          />
          {status === 'success' && (
            <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
          )}
          {status === 'error' && (
            <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
          )}
        </div>
        <Button 
          type="submit" 
          disabled={isRedeeming || !code.trim()}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6"
        >
          {isRedeeming ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            t('voucher.redeem')
          )}
        </Button>
      </form>
    </div>
  );
};
