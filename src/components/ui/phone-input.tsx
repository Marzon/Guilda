import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronDown, Loader2, Phone, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';
import { 
  parsePhoneNumberFromString, 
  isValidPhoneNumber,
  getCountryCallingCode,
  CountryCode,
  AsYouType
} from 'libphonenumber-js';

interface Country {
  code: CountryCode;
  name: string;
  flag: string;
  prefix: string;
}

const countries: Country[] = [
  { code: 'BR', name: 'Brasil', flag: '🇧🇷', prefix: '+55' },
  { code: 'US', name: 'United States', flag: '🇺🇸', prefix: '+1' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', prefix: '+351' },
  { code: 'ES', name: 'España', flag: '🇪🇸', prefix: '+34' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', prefix: '+54' },
  { code: 'MX', name: 'México', flag: '🇲🇽', prefix: '+52' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', prefix: '+57' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', prefix: '+56' },
  { code: 'PE', name: 'Perú', flag: '🇵🇪', prefix: '+51' },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾', prefix: '+598' },
  { code: 'PY', name: 'Paraguay', flag: '🇵🇾', prefix: '+595' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', prefix: '+44' },
  { code: 'DE', name: 'Deutschland', flag: '🇩🇪', prefix: '+49' },
  { code: 'FR', name: 'France', flag: '🇫🇷', prefix: '+33' },
  { code: 'IT', name: 'Italia', flag: '🇮🇹', prefix: '+39' },
];

interface PhoneInputProps {
  value: string;
  onChange: (value: string, isValid: boolean, e164?: string) => void;
  onValidationComplete?: (result: ValidationResult) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  defaultCountry?: CountryCode;
  className?: string;
}

interface ValidationResult {
  valid: boolean;
  phone_type?: string;
  carrier?: string;
  e164?: string;
  formatted?: string;
  country?: string;
  error?: string;
  source: 'veriphone' | 'local';
}

type ValidationStatus = 'idle' | 'validating' | 'valid' | 'invalid';

/**
 * Checks if a phone number contains suspicious patterns that indicate a fake number
 * Examples: 999999999, 123456789, 111111111, etc.
 */
function isSuspiciousPhoneNumber(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  
  // Remove country code for analysis (assuming max 3 digit country code)
  const localDigits = digits.length > 10 ? digits.slice(-10) : digits;
  
  if (localDigits.length < 8) return true;
  
  // Check for all same digits (e.g., 999999999)
  if (/^(\d)\1{7,}$/.test(localDigits)) return true;
  
  // Check for sequential ascending (e.g., 123456789)
  const ascending = '0123456789';
  if (ascending.includes(localDigits.slice(-8))) return true;
  
  // Check for sequential descending (e.g., 987654321)
  const descending = '9876543210';
  if (descending.includes(localDigits.slice(-8))) return true;
  
  // Check for repeating patterns (e.g., 12121212, 123123123)
  const patterns = [
    /^(\d{2})\1{3,}$/, // 12121212
    /^(\d{3})\1{2,}$/, // 123123123
    /^(\d{4})\1+$/,    // 12341234
  ];
  
  for (const pattern of patterns) {
    if (pattern.test(localDigits.slice(-8))) return true;
  }
  
  // Check for common fake Brazilian patterns
  // Brazilian mobile: DDD (2 digits) + 9 + 8 digits
  // If it's all 9s after the DDD, it's fake
  if (localDigits.length >= 11) {
    const afterDDD = localDigits.slice(-9);
    if (/^9{9}$/.test(afterDDD)) return true; // 999999999
    if (/^9+0+$/.test(afterDDD)) return true; // 999990000
    if (/^90+$/.test(afterDDD)) return true;  // 900000000
  }
  
  return false;
}

export function PhoneInput({
  value,
  onChange,
  onValidationComplete,
  label,
  placeholder,
  required = false,
  disabled = false,
  defaultCountry = 'BR',
  className,
}: PhoneInputProps) {
  const { t, currentLanguage } = useLanguage();
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    countries.find(c => c.code === defaultCountry) || countries[0]
  );
  const [open, setOpen] = useState(false);
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>('idle');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [displayValue, setDisplayValue] = useState(value);

  // Set default country based on language
  useEffect(() => {
    if (!value) {
      const langToCountry: Record<string, CountryCode> = {
        'pt': 'BR',
        'en': 'US',
        'es': 'ES',
      };
      const countryCode = langToCountry[currentLanguage] || defaultCountry;
      const country = countries.find(c => c.code === countryCode);
      if (country) {
        setSelectedCountry(country);
      }
    }
  }, [currentLanguage, defaultCountry, value]);

  // Format input as user types
  const handleInputChange = (inputValue: string) => {
    // Remove non-numeric characters for processing
    const numericValue = inputValue.replace(/\D/g, '');
    
    // Use AsYouType for formatting
    const formatter = new AsYouType(selectedCountry.code);
    const formatted = formatter.input(numericValue);
    
    setDisplayValue(formatted || inputValue);
    
    // Local validation with libphonenumber
    const isLibValid = isValidPhoneNumber(numericValue, selectedCountry.code);
    
    // Additional check for suspicious/fake patterns
    const isSuspicious = isSuspiciousPhoneNumber(numericValue);
    const isLocallyValid = isLibValid && !isSuspicious;
    
    // Get E.164 format for storage
    const parsed = parsePhoneNumberFromString(numericValue, selectedCountry.code);
    const e164 = parsed?.format('E.164');
    
    onChange(numericValue, isLocallyValid, e164);
    
    // Reset validation status when input changes
    if (validationStatus !== 'idle') {
      setValidationStatus('idle');
      setValidationError(null);
      setValidationResult(null);
    }
  };

  // Validate with API on blur
  const validateWithAPI = useCallback(async () => {
    if (!value || value.length < 8) {
      return;
    }

    // Check for suspicious patterns first
    if (isSuspiciousPhoneNumber(value)) {
      setValidationStatus('invalid');
      setValidationError(t('phone.suspiciousNumber'));
      onChange(value, false, undefined);
      return;
    }

    // Then check local validation with libphonenumber
    const isLocallyValid = isValidPhoneNumber(value, selectedCountry.code);
    if (!isLocallyValid) {
      setValidationStatus('invalid');
      setValidationError(t('phone.invalidForCountry'));
      return;
    }

    setValidationStatus('validating');
    setValidationError(null);

    try {
      const { data, error } = await supabase.functions.invoke('validate-phone', {
        body: { phone: value, defaultCountry: selectedCountry.code }
      });

      if (error) {
        console.error('Phone validation error:', error);
        // Fallback to local validation
        const parsed = parsePhoneNumberFromString(value, selectedCountry.code);
        setValidationStatus(isLocallyValid ? 'valid' : 'invalid');
        setValidationResult({
          valid: isLocallyValid,
          e164: parsed?.format('E.164'),
          source: 'local'
        });
        onChange(value, isLocallyValid, parsed?.format('E.164'));
        return;
      }

      const result = data as ValidationResult;
      setValidationResult(result);
      setValidationStatus(result.valid ? 'valid' : 'invalid');
      
      if (!result.valid) {
        setValidationError(result.error || t('phone.invalid'));
      }

      onChange(value, result.valid, result.e164);
      onValidationComplete?.(result);
    } catch (err) {
      console.error('Phone validation failed:', err);
      // Fallback to local validation
      setValidationStatus(isLocallyValid ? 'valid' : 'invalid');
    }
  }, [value, selectedCountry.code, t, onChange, onValidationComplete]);

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setOpen(false);
    // Re-validate with new country
    if (value) {
      handleInputChange(value);
    }
  };

  const getStatusIcon = () => {
    switch (validationStatus) {
      case 'validating':
        return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
      case 'valid':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'invalid':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Phone className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      
      <div className="flex gap-2">
        {/* Country Selector */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[100px] justify-between px-2"
              disabled={disabled}
            >
              <span className="flex items-center gap-1">
                <span className="text-lg">{selectedCountry.flag}</span>
                <span className="text-xs text-muted-foreground">{selectedCountry.prefix}</span>
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[250px] p-0" align="start">
            <Command>
              <CommandInput placeholder={t('phone.selectCountry')} />
              <CommandList>
                <CommandEmpty>{t('common.noResults')}</CommandEmpty>
                <CommandGroup>
                  {countries.map((country) => (
                    <CommandItem
                      key={country.code}
                      value={`${country.name} ${country.code}`}
                      onSelect={() => handleCountrySelect(country)}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-lg">{country.flag}</span>
                        <span>{country.name}</span>
                        <span className="text-xs text-muted-foreground">{country.prefix}</span>
                      </span>
                      {selectedCountry.code === country.code && (
                        <Check className="ml-auto h-4 w-4" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Phone Input */}
        <div className="relative flex-1">
          <Input
            type="tel"
            value={displayValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onBlur={validateWithAPI}
            placeholder={placeholder || t('phone.placeholder')}
            disabled={disabled}
            className={cn(
              "pr-10",
              validationStatus === 'invalid' && "border-destructive focus-visible:ring-destructive",
              validationStatus === 'valid' && "border-green-500 focus-visible:ring-green-500"
            )}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {getStatusIcon()}
          </div>
        </div>
      </div>

      {/* Validation feedback */}
      {validationError && (
        <p className="text-sm text-destructive">{validationError}</p>
      )}
      
      {validationStatus === 'valid' && validationResult && (
        <p className="text-sm text-muted-foreground">
          {validationResult.formatted && `📞 ${validationResult.formatted}`}
          {validationResult.carrier && ` • ${validationResult.carrier}`}
          {validationResult.phone_type && ` • ${validationResult.phone_type}`}
        </p>
      )}

      {!validationError && validationStatus === 'idle' && (
        <p className="text-xs text-muted-foreground">
          {t('phone.hint')}
        </p>
      )}
    </div>
  );
}
