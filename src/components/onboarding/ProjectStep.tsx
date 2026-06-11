import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RoleDefinitionForm } from "@/components/RoleDefinitionForm";
import { useLanguage } from "@/hooks/useLanguage";
import { 
  Zap,
  ShoppingCart, 
  Smartphone, 
  Bot, 
  Gamepad2, 
  Building2, 
  GraduationCap,
  Leaf,
  Heart
} from "lucide-react";
import type { Archetype } from "@/types/archetype";

interface RoleData {
  role_name: string;
  role_description: string;
  required_archetype: Archetype | null;
  required_skills: string[];
  is_filled: boolean;
}

interface Template {
  id: string;
  icon: React.ReactNode;
  titleKey: string;
  defaultTitle: string;
  defaultDescription: string;
  suggestedRole: RoleData;
  color: string;
}

const TEMPLATES: Template[] = [
  {
    id: "ecommerce",
    icon: <ShoppingCart className="w-5 h-5" />,
    titleKey: "E-commerce",
    defaultTitle: "Meu E-commerce",
    defaultDescription: "Plataforma de e-commerce para venda de produtos online.",
    suggestedRole: {
      role_name: "Co-fundador(a) Comercial",
      role_description: "Responsável por vendas, marketing e aquisição de clientes.",
      required_archetype: "SELLER",
      required_skills: [],
      is_filled: false
    },
    color: "bg-orange-500"
  },
  {
    id: "mobile",
    icon: <Smartphone className="w-5 h-5" />,
    titleKey: "App Mobile",
    defaultTitle: "Meu App Mobile",
    defaultDescription: "Aplicativo mobile para resolver problemas do dia a dia.",
    suggestedRole: {
      role_name: "Co-fundador(a) de Produto",
      role_description: "Responsável por growth, produto e experiência do usuário.",
      required_archetype: "SELLER",
      required_skills: [],
      is_filled: false
    },
    color: "bg-blue-500"
  },
  {
    id: "saas",
    icon: <Bot className="w-5 h-5" />,
    titleKey: "SaaS B2B",
    defaultTitle: "Meu SaaS B2B",
    defaultDescription: "Software como serviço para empresas automatizarem processos.",
    suggestedRole: {
      role_name: "Co-fundador(a) de Vendas",
      role_description: "Responsável por vendas enterprise e relacionamento com clientes.",
      required_archetype: "SELLER",
      required_skills: [],
      is_filled: false
    },
    color: "bg-purple-500"
  },
  {
    id: "games",
    icon: <Gamepad2 className="w-5 h-5" />,
    titleKey: "Games",
    defaultTitle: "Meu Game",
    defaultDescription: "Jogo digital para desktop ou mobile.",
    suggestedRole: {
      role_name: "Co-fundador(a) de Marketing",
      role_description: "Responsável por comunidade, lançamento e monetização.",
      required_archetype: "SELLER",
      required_skills: [],
      is_filled: false
    },
    color: "bg-pink-500"
  },
  {
    id: "marketplace",
    icon: <Building2 className="w-5 h-5" />,
    titleKey: "Marketplace",
    defaultTitle: "Meu Marketplace",
    defaultDescription: "Plataforma conectando compradores e vendedores.",
    suggestedRole: {
      role_name: "Co-fundador(a) de Operações",
      role_description: "Responsável por aquisição de parceiros e operações.",
      required_archetype: "SELLER",
      required_skills: [],
      is_filled: false
    },
    color: "bg-emerald-500"
  },
  {
    id: "edtech",
    icon: <GraduationCap className="w-5 h-5" />,
    titleKey: "EdTech",
    defaultTitle: "Minha EdTech",
    defaultDescription: "Plataforma de educação e cursos online.",
    suggestedRole: {
      role_name: "Co-fundador(a) Pedagógico",
      role_description: "Responsável por conteúdo, currículo e parcerias educacionais.",
      required_archetype: "SELLER",
      required_skills: [],
      is_filled: false
    },
    color: "bg-cyan-500"
  },
  {
    id: "sustainability",
    icon: <Leaf className="w-5 h-5" />,
    titleKey: "GreenTech",
    defaultTitle: "Minha GreenTech",
    defaultDescription: "Solução sustentável para impacto ambiental positivo.",
    suggestedRole: {
      role_name: "Co-fundador(a) de Impacto",
      role_description: "Responsável por parcerias ESG e comunicação de impacto.",
      required_archetype: "SELLER",
      required_skills: [],
      is_filled: false
    },
    color: "bg-green-500"
  },
  {
    id: "health",
    icon: <Heart className="w-5 h-5" />,
    titleKey: "HealthTech",
    defaultTitle: "Minha HealthTech",
    defaultDescription: "Solução para saúde e bem-estar.",
    suggestedRole: {
      role_name: "Co-fundador(a) de Negócios",
      role_description: "Responsável por parcerias com clínicas e profissionais de saúde.",
      required_archetype: "SELLER",
      required_skills: [],
      is_filled: false
    },
    color: "bg-red-500"
  }
];

interface ProjectStepProps {
  projectTitle: string;
  setProjectTitle: (value: string) => void;
  projectDescription: string;
  setProjectDescription: (value: string) => void;
  projectRoles: RoleData[];
  setProjectRoles: (roles: RoleData[]) => void;
  showRoleForm: boolean;
  setShowRoleForm: (show: boolean) => void;
}

export const ProjectStep = ({
  projectTitle,
  setProjectTitle,
  projectDescription,
  setProjectDescription,
  projectRoles,
  setProjectRoles,
  showRoleForm,
  setShowRoleForm,
}: ProjectStepProps) => {
  const { t } = useLanguage();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [addSuggestedRole, setAddSuggestedRole] = useState(true);

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setProjectTitle(template.defaultTitle);
    setProjectDescription(template.defaultDescription);
    
    // Add the suggested role automatically if not already added
    if (addSuggestedRole && projectRoles.length === 0) {
      setProjectRoles([template.suggestedRole]);
    }
  };

  const toggleSuggestedRole = () => {
    const newValue = !addSuggestedRole;
    setAddSuggestedRole(newValue);
    
    if (selectedTemplate) {
      if (newValue && projectRoles.length === 0) {
        setProjectRoles([selectedTemplate.suggestedRole]);
      } else if (!newValue) {
        // Remove the suggested role if it matches
        setProjectRoles(projectRoles.filter(r => r.role_name !== selectedTemplate.suggestedRole.role_name));
      }
    }
  };

  const addRole = (role: RoleData) => {
    setProjectRoles([...projectRoles, role]);
    setShowRoleForm(false);
  };

  const removeRole = (index: number) => {
    setProjectRoles(projectRoles.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h1 className="text-3xl font-display font-bold mb-2">
          {t('onboarding.createProject')}
        </h1>
        <p className="text-muted-foreground">{t('onboarding.projectOptional')}</p>
      </div>

      {/* Quick Templates Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Zap className="w-4 h-4 text-primary" />
          {t('onboarding.quickStart') || 'Início Rápido'}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => handleSelectTemplate(template)}
              className={`p-3 sm:p-3 rounded-xl border-2 transition-all text-center hover:border-primary/50 hover:shadow-md min-h-[72px] sm:min-h-0 ${
                selectedTemplate?.id === template.id 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border'
              }`}
            >
              <div className={`w-9 h-9 sm:w-8 sm:h-8 rounded-lg ${template.color} text-white flex items-center justify-center mx-auto mb-1.5`}>
                {template.icon}
              </div>
              <p className="text-xs font-medium truncate">{template.titleKey}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="projectTitle">{t('onboarding.projectTitle')}</Label>
          <Input
            id="projectTitle"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            placeholder={t('onboarding.projectTitlePlaceholder')}
            className="glass"
          />
        </div>

        <div>
          <Label htmlFor="projectDescription">{t('onboarding.projectDescription')}</Label>
          <Textarea
            id="projectDescription"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            placeholder={t('onboarding.projectDescPlaceholder')}
            className="glass min-h-[100px]"
          />
        </div>

        {/* Suggested role toggle when template is selected */}
        {selectedTemplate && (
          <div 
            onClick={toggleSuggestedRole}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              addSuggestedRole 
                ? 'border-primary bg-primary/5' 
                : 'border-muted hover:border-muted-foreground/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  addSuggestedRole ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                }`}>
                  {addSuggestedRole && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div>
                  <p className="font-medium text-sm">{t('onboarding.addSuggestedRole') || 'Adicionar vaga sugerida'}</p>
                  <p className="text-xs text-muted-foreground">{selectedTemplate.suggestedRole.role_name}</p>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs">
                {selectedTemplate.suggestedRole.required_archetype}
              </Badge>
            </div>
          </div>
        )}

        <div>
          <Label>{t('onboarding.needSomeone')}</Label>
          <div className="space-y-2 mt-2">
            {projectRoles.map((role, index) => (
              <Card key={index} className="glass p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold">{role.role_name}</p>
                    <p className="text-sm text-muted-foreground">{role.required_archetype}</p>
                    {role.required_skills.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {role.required_skills.join(", ")}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRole(index)}
                  >
                    ✕
                  </Button>
                </div>
              </Card>
            ))}

            {!showRoleForm ? (
              <Button
                variant="outline"
                onClick={() => setShowRoleForm(true)}
                className="w-full"
              >
                + {t('onboarding.addRole')}
              </Button>
            ) : (
              <Card className="glass p-4">
                <RoleDefinitionForm
                  onAdd={addRole}
                  onCancel={() => setShowRoleForm(false)}
                />
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
