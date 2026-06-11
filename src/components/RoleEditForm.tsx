import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SkillLibraryPicker } from "@/components/skills/SkillLibraryPicker";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import type { Archetype } from "@/types/archetype";

interface RoleData {
  role_name: string;
  role_description: string | null;
  required_archetype: Archetype | null;
  required_skills: string[];
}

interface RoleEditFormProps {
  initialData: RoleData;
  onSave: (data: RoleData) => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export const RoleEditForm = ({ initialData, onSave, onCancel, isSaving }: RoleEditFormProps) => {
  const { t } = useTranslation();
  const [roleName, setRoleName] = useState(initialData.role_name);
  const [roleDescription, setRoleDescription] = useState(initialData.role_description || "");
  const [archetype, setArchetype] = useState<Archetype | "NONE">(
    initialData.required_archetype || "NONE"
  );
  const [skills, setSkills] = useState<string[]>(initialData.required_skills || []);

  const handleSubmit = () => {
    if (!roleName.trim()) return;

    onSave({
      role_name: roleName,
      role_description: roleDescription || null,
      required_archetype: archetype === "NONE" ? null : archetype,
      required_skills: skills,
    });
  };

  return (
    <div className="space-y-4 p-4 bg-muted/50 rounded-lg border">
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
        <Button onClick={handleSubmit} disabled={!roleName.trim() || isSaving} className="flex-1">
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t("common.saving", "Salvando...")}
            </>
          ) : (
            t("common.save", "Salvar")
          )}
        </Button>
        <Button onClick={onCancel} variant="outline" disabled={isSaving}>
          {t("common.cancel")}
        </Button>
      </div>
    </div>
  );
};
