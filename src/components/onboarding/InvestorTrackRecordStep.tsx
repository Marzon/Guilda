import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, Plus, Trash2, CheckCircle2, ExternalLink, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export interface Investment {
  id: string;
  startupName: string;
  websiteUrl: string;
}

interface InvestorTrackRecordStepProps {
  investments: Investment[];
  setInvestments: (investments: Investment[]) => void;
  investorType: string | null;
  setInvestorType: (type: string) => void;
  investorSectors: string[];
  setInvestorSectors: (sectors: string[]) => void;
  investorCheckRange: string | null;
  setInvestorCheckRange: (range: string) => void;
}

// Rigorous URL validation
const validateUrl = (url: string): { valid: boolean; error?: string } => {
  if (!url.trim()) {
    return { valid: false, error: "URL obrigatória" };
  }

  // URL pattern - requires valid domain format
  const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}(\/[\w\-./?%&=]*)?$/i;
  if (!urlPattern.test(url.trim())) {
    return { valid: false, error: "URL inválida. Ex: startup.com.br" };
  }

  // Extract domain name for validation
  const cleanUrl = url.trim().replace(/^https?:\/\//, '').split('/')[0];
  const domainName = cleanUrl.split('.')[0];
  
  // Block purely numeric domains (111.com, 222.com, etc)
  if (/^\d+$/.test(domainName)) {
    return { valid: false, error: "Use uma URL real da startup, não números" };
  }
  
  // Block very short domain names (less than 3 chars)
  if (domainName.length < 3) {
    return { valid: false, error: "Nome do domínio muito curto" };
  }
  
  // Block domains that are mostly numbers (more than 50% digits)
  const digitCount = (domainName.match(/\d/g) || []).length;
  if (digitCount > domainName.length / 2) {
    return { valid: false, error: "Use uma URL real, não códigos numéricos" };
  }

  // Block generic/test URLs
  const blockedPatterns = [
    'example.com', 'test.com', 'localhost', '127.0.0.1',
    'asdf.com', 'qwer.com', 'placeholder.com', 'fake.com',
    'domain.com', 'site.com', 'website.com', 'url.com',
    'abc.com', 'xyz.com', 'aaa.com', 'bbb.com', 'ccc.com',
    'teste.com', 'temp.com', 'dummy.com', 'sample.com'
  ];
  const lowerUrl = url.toLowerCase();
  if (blockedPatterns.some(pattern => lowerUrl.includes(pattern))) {
    return { valid: false, error: "Use uma URL real da startup" };
  }

  return { valid: true };
};

const formatUrl = (url: string): string => {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

// Investor types
const INVESTOR_TYPES = [
  { value: "ANGEL", labelKey: "investor.type.ANGEL" },
  { value: "SEED", labelKey: "investor.type.SEED" },
  { value: "SERIES_A", labelKey: "investor.type.SERIES_A" },
  { value: "SERIES_B_PLUS", labelKey: "investor.type.SERIES_B_PLUS" },
  { value: "MULTI_STAGE", labelKey: "investor.type.MULTI_STAGE" },
];

// Sectors
const INVESTOR_SECTORS = [
  { value: "FINTECH", labelKey: "investor.sector.FINTECH" },
  { value: "SAAS", labelKey: "investor.sector.SAAS" },
  { value: "HEALTHTECH", labelKey: "investor.sector.HEALTHTECH" },
  { value: "EDTECH", labelKey: "investor.sector.EDTECH" },
  { value: "ECOMMERCE", labelKey: "investor.sector.ECOMMERCE" },
  { value: "LOGISTICS", labelKey: "investor.sector.LOGISTICS" },
  { value: "AGTECH", labelKey: "investor.sector.AGTECH" },
  { value: "OTHER", labelKey: "investor.sector.OTHER" },
];

// Check ranges
const CHECK_RANGES = [
  { value: "UP_TO_50K", labelKey: "investor.checkRange.UP_TO_50K" },
  { value: "50K_TO_200K", labelKey: "investor.checkRange.50K_TO_200K" },
  { value: "200K_TO_500K", labelKey: "investor.checkRange.200K_TO_500K" },
  { value: "500K_TO_1M", labelKey: "investor.checkRange.500K_TO_1M" },
  { value: "ABOVE_1M", labelKey: "investor.checkRange.ABOVE_1M" },
];

export const InvestorTrackRecordStep = ({
  investments,
  setInvestments,
  investorType,
  setInvestorType,
  investorSectors,
  setInvestorSectors,
  investorCheckRange,
  setInvestorCheckRange,
}: InvestorTrackRecordStepProps) => {
  const { t } = useLanguage();
  const [newStartupName, setNewStartupName] = useState("");
  const [newWebsiteUrl, setNewWebsiteUrl] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);

  const validCount = investments.filter((inv) => {
    const urlValidation = validateUrl(inv.websiteUrl);
    return inv.startupName.trim().length >= 2 && urlValidation.valid;
  }).length;
  const minimumReached = validCount >= 1;

  const handleAddInvestment = () => {
    // Validate startup name
    if (!newStartupName.trim() || newStartupName.trim().length < 2) {
      toast.error(t("investor.trackRecord.nameRequired", "Nome da startup obrigatório"));
      return;
    }

    // Validate URL
    const urlValidation = validateUrl(newWebsiteUrl);
    if (!urlValidation.valid) {
      setUrlError(urlValidation.error || null);
      toast.error(urlValidation.error);
      return;
    }

    // Check for duplicate URL
    const normalizedUrl = formatUrl(newWebsiteUrl).toLowerCase().replace(/\/$/, "");
    if (investments.some((inv) => formatUrl(inv.websiteUrl).toLowerCase().replace(/\/$/, "") === normalizedUrl)) {
      toast.error(t("investor.trackRecord.duplicateUrl", "Esta startup já foi adicionada"));
      return;
    }

    // Check for duplicate name
    if (investments.some((inv) => inv.startupName.toLowerCase().trim() === newStartupName.toLowerCase().trim())) {
      toast.error(t("investor.trackRecord.duplicateName", "Startup com este nome já existe"));
      return;
    }

    const newInvestment: Investment = {
      id: crypto.randomUUID(),
      startupName: newStartupName.trim(),
      websiteUrl: formatUrl(newWebsiteUrl),
    };

    setInvestments([...investments, newInvestment]);
    setNewStartupName("");
    setNewWebsiteUrl("");
    setUrlError(null);
  };

  const handleRemoveInvestment = (id: string) => {
    setInvestments(investments.filter((inv) => inv.id !== id));
  };

  const handleSectorToggle = (sector: string) => {
    if (investorSectors.includes(sector)) {
      setInvestorSectors(investorSectors.filter((s) => s !== sector));
    } else if (investorSectors.length < 3) {
      setInvestorSectors([...investorSectors, sector]);
    } else {
      toast.error(t("investor.trackRecord.maxSectors", "Selecione no máximo 3 setores"));
    }
  };

  const canAdd = newStartupName.trim().length >= 2 && validateUrl(newWebsiteUrl).valid;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-4">
          <Briefcase className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          {t("investor.trackRecord.title", "Seu Track Record")}
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          {t(
            "investor.trackRecord.subtitle",
            "Para garantir a qualidade do ecossistema, listamos apenas investidores ativos. Complete seu perfil."
          )}
        </p>
      </div>

      {/* Warning message */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-amber-800 dark:text-amber-300">
              {t("investor.trackRecord.warningTitle", "Obrigatório para investidores")}
            </p>
            <p className="text-amber-700 dark:text-amber-400 mt-1">
              {t(
                "investor.trackRecord.warningMessage",
                "Para se cadastrar como investidor, é necessário informar pelo menos um investimento realizado. Se você ainda não investiu em startups, volte e escolha o perfil Builder ou Seller."
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Investor Type Selection */}
      <Card className="p-4">
        <Label className="text-sm font-medium mb-3 block">
          {t("investor.trackRecord.selectType", "Qual seu perfil de investidor?")} *
        </Label>
        <RadioGroup
          value={investorType || ""}
          onValueChange={setInvestorType}
          className="grid grid-cols-2 sm:grid-cols-3 gap-2"
        >
          {INVESTOR_TYPES.map((type) => (
            <div key={type.value} className="flex items-center space-x-2">
              <RadioGroupItem value={type.value} id={type.value} />
              <Label htmlFor={type.value} className="cursor-pointer text-sm">
                {t(type.labelKey, type.value)}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </Card>

      {/* Sectors Selection */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <Label className="text-sm font-medium">
            {t("investor.trackRecord.selectSectors", "Setores de interesse")} *
          </Label>
          <Badge variant="outline" className="text-xs">
            {investorSectors.length}/3
          </Badge>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {INVESTOR_SECTORS.map((sector) => (
            <div
              key={sector.value}
              className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors ${
                investorSectors.includes(sector.value)
                  ? "bg-emerald-100 dark:bg-emerald-900/50"
                  : "hover:bg-muted"
              }`}
              onClick={() => handleSectorToggle(sector.value)}
            >
              <Checkbox
                checked={investorSectors.includes(sector.value)}
                onCheckedChange={() => handleSectorToggle(sector.value)}
                id={`sector-${sector.value}`}
              />
              <Label
                htmlFor={`sector-${sector.value}`}
                className="cursor-pointer text-sm flex-1"
              >
                {t(sector.labelKey, sector.value)}
              </Label>
            </div>
          ))}
        </div>
      </Card>

      {/* Check Range Selection */}
      <Card className="p-4">
        <Label className="text-sm font-medium mb-3 block">
          {t("investor.trackRecord.selectCheckRange", "Qual seu range de cheque típico?")} *
        </Label>
        <Select value={investorCheckRange || ""} onValueChange={setInvestorCheckRange}>
          <SelectTrigger>
            <SelectValue placeholder={t("investor.trackRecord.selectCheckPlaceholder", "Selecione...")} />
          </SelectTrigger>
          <SelectContent>
            {CHECK_RANGES.map((range) => (
              <SelectItem key={range.value} value={range.value}>
                {t(range.labelKey, range.value)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2">
        <div
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            minimumReached
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {minimumReached ? (
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {t("investor.trackRecord.minimumReached", "Mínimo atingido!")}
            </span>
          ) : (
            t("investor.trackRecord.minimum", "{{count}} de 1 startup mínimo", {
              count: validCount,
            })
          )}
        </div>
      </div>

      {/* Investments list */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {investments.map((investment, index) => {
            const urlValidation = validateUrl(investment.websiteUrl);
            const isValid = investment.startupName.trim().length >= 2 && urlValidation.valid;
            
            return (
              <motion.div
                key={investment.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  className={`p-4 border-2 transition-colors ${
                    isValid
                      ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20"
                      : "border-destructive/50 bg-destructive/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      isValid 
                        ? "bg-emerald-100 dark:bg-emerald-900/50" 
                        : "bg-destructive/20"
                    }`}>
                      {isValid ? (
                        <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                          {index + 1}
                        </span>
                      ) : (
                        <AlertCircle className="w-4 h-4 text-destructive" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {investment.startupName}
                      </p>
                      <a
                        href={investment.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-emerald-600 flex items-center gap-1 truncate"
                      >
                        {investment.websiteUrl.replace(/^https?:\/\//, "")}
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                      {!urlValidation.valid && (
                        <p className="text-xs text-destructive mt-1">{urlValidation.error}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveInvestment(investment.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Add new investment form */}
      <Card className="p-4 border-dashed border-2">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startupName">
                {t("investor.trackRecord.startupName", "Nome da Startup")} *
              </Label>
              <Input
                id="startupName"
                value={newStartupName}
                onChange={(e) => setNewStartupName(e.target.value)}
                placeholder={t(
                  "investor.trackRecord.startupNamePlaceholder",
                  "Ex: ContaAzul"
                )}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && canAdd) {
                    e.preventDefault();
                    handleAddInvestment();
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="websiteUrl">
                {t("investor.trackRecord.websiteUrl", "Link do Site")} *
              </Label>
              <Input
                id="websiteUrl"
                value={newWebsiteUrl}
                onChange={(e) => {
                  setNewWebsiteUrl(e.target.value);
                  setUrlError(null);
                }}
                placeholder={t(
                  "investor.trackRecord.websiteUrlPlaceholder",
                  "Ex: contaazul.com"
                )}
                className={urlError ? "border-destructive" : ""}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && canAdd) {
                    e.preventDefault();
                    handleAddInvestment();
                  }
                }}
              />
              {urlError && (
                <p className="text-xs text-destructive">{urlError}</p>
              )}
            </div>
          </div>
          <Button
            onClick={handleAddInvestment}
            disabled={!canAdd}
            variant="outline"
            className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t("investor.trackRecord.addAnother", "Adicionar startup")}
          </Button>
        </div>
      </Card>
    </div>
  );
};
