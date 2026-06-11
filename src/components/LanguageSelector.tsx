import { Globe, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/hooks/useLanguage";

export const LanguageSelector = () => {
  const { currentLanguage, changeLanguage, availableLanguages } = useLanguage();

  // Normalize language code to handle "en-US" -> "en"
  const normalizedLanguage = currentLanguage?.split('-')[0] || 'en';

  const handleLanguageChange = (langCode: string) => {
    changeLanguage(langCode as 'en' | 'pt' | 'es');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-foreground hover:text-primary">
          <Globe className="h-5 w-5" />
          <span className="sr-only">Select language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-48 bg-card border-border shadow-lg z-50"
        sideOffset={8}
      >
        {availableLanguages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onSelect={() => handleLanguageChange(lang.code)}
            className={`cursor-pointer flex items-center gap-2 ${
              normalizedLanguage === lang.code ? "bg-muted font-semibold" : ""
            }`}
          >
            <span className="text-lg">{lang.flag}</span>
            <span className="flex-1">{lang.nativeName}</span>
            {normalizedLanguage === lang.code && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
