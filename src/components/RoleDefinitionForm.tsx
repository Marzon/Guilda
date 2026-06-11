import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SkillLibraryPicker } from "@/components/skills/SkillLibraryPicker";
import { useTranslation } from "react-i18next";
import type { Archetype } from "@/types/archetype";

interface RoleData {
  role_name: string;
  role_description: string;
  required_archetype: Archetype | null;
  required_skills: string[];
  is_filled: boolean;
}

interface RoleDefinitionFormProps {
  onAdd: (role: RoleData) => void;
  onCancel?: () => void;
}

export const RoleDefinitionForm = ({ onAdd, onCancel }: RoleDefinitionFormProps) => {
  const { t } = useTranslation();
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [archetype, setArchetype] = useState<"BUILDER" | "SELLER" | "INVESTOR" | "NONE">("NONE");
  const [skills, setSkills] = useState<string[]>([]);

  const handleSubmit = () => {
    if (!roleName.trim()) return;

    onAdd({
      role_name: roleName,
      role_description: roleDescription,
      required_archetype: archetype === "NONE" ? null : archetype,
      required_skills: skills,
      is_filled: false,
    });

    setRoleName("");
    setRoleDescription("");
    setArchetype("NONE");
    setSkills([]);
  };

  return (
    <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
      <div className="space-y-2">
        <Label>{t("projects.roleName", "Nome da Role")} *</Label>
        <Input
          placeholder={t("roles.namePlaceholder")}
          value={roleName}
          onChange={(e) => setRoleName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>{t("projects.roleDescription", "Descrição")}</Label>
        <Textarea
          placeholder={t("roles.descriptionPlaceholder")}
          value={roleDescription}
          onChange={(e) => setRoleDescription(e.target.value)}
          className="resize-none"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>{t("projects.requiredClass", "Classe Requerida")}</Label>
        <Select value={archetype} onValueChange={(v) => setArchetype(v as any)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NONE">{t("projects.anyClass", "Qualquer classe")}</SelectItem>
            <SelectItem value="BUILDER">Builder</SelectItem>
            <SelectItem value="SELLER">Seller</SelectItem>
            <SelectItem value="INVESTOR">Investor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{t("projects.desiredSkills", "Skills Desejadas")}</Label>
        <SkillLibraryPicker
          selectedSkills={skills}
          onSkillsChange={setSkills}
          maxSkills={10}
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button onClick={handleSubmit} disabled={!roleName.trim()} className="flex-1">
          {t("projects.addRole", "Adicionar Role")}
        </Button>
        {onCancel && (
          <Button onClick={onCancel} variant="outline">
            {t("common.cancel")}
          </Button>
        )}
      </div>
    </div>
  );
};