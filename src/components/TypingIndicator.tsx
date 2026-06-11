import { useLanguage } from '@/hooks/useLanguage';

interface TypingIndicatorProps {
  username: string;
}

export const TypingIndicator = ({ username }: TypingIndicatorProps) => {
  const { t } = useLanguage();
  
  return (
    <div className="flex items-center gap-2 glass rounded-2xl px-4 py-2 w-fit animate-fade-in">
      <span className="text-sm text-muted-foreground">
        {t('chat.isTyping', { username })}
      </span>
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
      </div>
    </div>
  );
};
