import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Edit,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Save,
  Loader2,
  Megaphone,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";

interface MktBanner {
  id: string;
  name: string;
  slug: string | null;
  title: string;
  description: string | null;
  cta_text: string | null;
  cta_link: string | null;
  secondary_cta_text: string | null;
  secondary_cta_link: string | null;
  icon: string | null;
  image_url: string | null;
  type: "top_bar" | "modal" | "floating" | "inline";
  variant: "default" | "success" | "warning" | "info" | "gradient" | "custom";
  custom_gradient: string | null;
  custom_bg_color: string | null;
  custom_text_color: string | null;
  audience: "all" | "anonymous" | "authenticated" | "free" | "premium";
  pages: string[];
  exclude_pages: string[];
  is_dismissible: boolean;
  dismiss_duration_hours: number;
  show_once_per_session: boolean;
  priority: number;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  views_count: number;
  clicks_count: number;
  dismisses_count: number;
  created_at: string;
  updated_at: string;
}

type BannerType = "top_bar" | "modal" | "floating" | "inline";
type BannerVariant = "default" | "success" | "warning" | "info" | "gradient" | "custom";
type BannerAudience = "all" | "anonymous" | "authenticated" | "free" | "premium";

const defaultForm: {
  name: string;
  slug: string;
  title: string;
  description: string;
  cta_text: string;
  cta_link: string;
  secondary_cta_text: string;
  secondary_cta_link: string;
  icon: string;
  image_url: string;
  type: BannerType;
  variant: BannerVariant;
  custom_gradient: string;
  custom_bg_color: string;
  custom_text_color: string;
  audience: BannerAudience;
  pages: string;
  exclude_pages: string;
  is_dismissible: boolean;
  dismiss_duration_hours: number;
  show_once_per_session: boolean;
  priority: number;
  start_date: string;
  end_date: string;
} = {
  name: "",
  slug: "",
  title: "",
  description: "",
  cta_text: "",
  cta_link: "",
  secondary_cta_text: "",
  secondary_cta_link: "",
  icon: "",
  image_url: "",
  type: "top_bar",
  variant: "default",
  custom_gradient: "",
  custom_bg_color: "",
  custom_text_color: "",
  audience: "all",
  pages: "",
  exclude_pages: "",
  is_dismissible: true,
  dismiss_duration_hours: 24,
  show_once_per_session: false,
  priority: 0,
  start_date: "",
  end_date: "",
};

const typeLabels = {
  top_bar: "Barra Superior",
  modal: "Modal",
  floating: "Flutuante",
  inline: "Inline",
};

const variantLabels = {
  default: "Padrão",
  success: "Sucesso",
  warning: "Aviso",
  info: "Informação",
  gradient: "Gradiente",
  custom: "Personalizado",
};

const audienceLabels = {
  all: "Todos",
  anonymous: "Anônimos",
  authenticated: "Autenticados",
  free: "Free",
  premium: "Premium",
};

export default function BannersAdmin() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ["admin-mkt-banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mkt_banners")
        .select("*")
        .order("priority", { ascending: false });
      if (error) throw error;
      return data as MktBanner[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        slug: form.slug || null,
        title: form.title,
        description: form.description || null,
        cta_text: form.cta_text || null,
        cta_link: form.cta_link || null,
        secondary_cta_text: form.secondary_cta_text || null,
        secondary_cta_link: form.secondary_cta_link || null,
        icon: form.icon || null,
        image_url: form.image_url || null,
        type: form.type,
        variant: form.variant,
        custom_gradient: form.custom_gradient || null,
        custom_bg_color: form.custom_bg_color || null,
        custom_text_color: form.custom_text_color || null,
        audience: form.audience,
        pages: form.pages ? form.pages.split(",").map((p) => p.trim()).filter(Boolean) : [],
        exclude_pages: form.exclude_pages ? form.exclude_pages.split(",").map((p) => p.trim()).filter(Boolean) : [],
        is_dismissible: form.is_dismissible,
        dismiss_duration_hours: form.dismiss_duration_hours,
        show_once_per_session: form.show_once_per_session,
        priority: form.priority,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      };

      if (editingId) {
        const { error } = await supabase
          .from("mkt_banners")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("mkt_banners").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-mkt-banners"] });
      toast.success(editingId ? "Banner atualizado!" : "Banner criado!");
      handleClose();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("mkt_banners")
        .update({ is_active: isActive })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, { isActive }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-mkt-banners"] });
      toast.success(isActive ? "Banner ativado!" : "Banner desativado!");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("mkt_banners").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-mkt-banners"] });
      toast.success("Banner excluído!");
      setDeleteId(null);
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (banner: MktBanner) => {
      const { id, created_at, updated_at, views_count, clicks_count, dismisses_count, ...rest } = banner;
      const { error } = await supabase.from("mkt_banners").insert({
        ...rest,
        name: `${rest.name} (cópia)`,
        slug: rest.slug ? `${rest.slug}-copy-${Date.now()}` : null,
        is_active: false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-mkt-banners"] });
      toast.success("Banner duplicado!");
    },
  });

  const handleEdit = (banner: MktBanner) => {
    setEditingId(banner.id);
    setForm({
      name: banner.name,
      slug: banner.slug || "",
      title: banner.title,
      description: banner.description || "",
      cta_text: banner.cta_text || "",
      cta_link: banner.cta_link || "",
      secondary_cta_text: banner.secondary_cta_text || "",
      secondary_cta_link: banner.secondary_cta_link || "",
      icon: banner.icon || "",
      image_url: banner.image_url || "",
      type: banner.type,
      variant: banner.variant,
      custom_gradient: banner.custom_gradient || "",
      custom_bg_color: banner.custom_bg_color || "",
      custom_text_color: banner.custom_text_color || "",
      audience: banner.audience,
      pages: banner.pages?.join(", ") || "",
      exclude_pages: banner.exclude_pages?.join(", ") || "",
      is_dismissible: banner.is_dismissible,
      dismiss_duration_hours: banner.dismiss_duration_hours,
      show_once_per_session: banner.show_once_per_session,
      priority: banner.priority,
      start_date: banner.start_date ? banner.start_date.slice(0, 16) : "",
      end_date: banner.end_date ? banner.end_date.slice(0, 16) : "",
    });
    setIsOpen(true);
  };

  const handleNew = () => {
    setEditingId(null);
    setForm(defaultForm);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setEditingId(null);
    setForm(defaultForm);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Banners</h1>
          <p className="text-muted-foreground">
            Gerencie banners promocionais do site Marketing
          </p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Banner
        </Button>
      </div>

      {/* Banners Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <Card className="col-span-full">
            <CardContent className="py-8 text-center text-muted-foreground">
              Carregando...
            </CardContent>
          </Card>
        ) : banners.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-8 text-center text-muted-foreground">
              Nenhum banner criado ainda
            </CardContent>
          </Card>
        ) : (
          banners.map((banner) => (
            <Card key={banner.id} className={!banner.is_active ? "opacity-60" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Megaphone className="h-4 w-4 text-primary" />
                      {banner.name}
                    </CardTitle>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline">{typeLabels[banner.type]}</Badge>
                      <Badge variant="secondary">{audienceLabels[banner.audience]}</Badge>
                      {banner.is_active ? (
                        <Badge className="bg-green-500">Ativo</Badge>
                      ) : (
                        <Badge variant="secondary">Inativo</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm font-medium line-clamp-2">{banner.title}</p>
                {banner.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {banner.description}
                  </p>
                )}
                
                {/* Stats */}
                <div className="flex gap-4 text-xs text-muted-foreground pt-2 border-t">
                  <span className="flex items-center gap-1">
                    <BarChart3 className="h-3 w-3" />
                    {banner.views_count} views
                  </span>
                  <span>{banner.clicks_count} cliques</span>
                  <span>{banner.dismisses_count} dismisses</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleMutation.mutate({ id: banner.id, isActive: !banner.is_active })}
                    title={banner.is_active ? "Desativar" : "Ativar"}
                  >
                    {banner.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(banner)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => duplicateMutation.mutate(banner)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteId(banner.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Editar Banner" : "Novo Banner"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Nome interno *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Black Friday 2026"
                />
              </div>
              <div className="space-y-2">
                <Label>Slug (único)</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="black-friday-2026"
                />
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="🔥 Promoção especial!"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Aproveite 50% de desconto..."
                rows={2}
              />
            </div>

            {/* CTA */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Texto do CTA</Label>
                <Input
                  value={form.cta_text}
                  onChange={(e) => setForm({ ...form, cta_text: e.target.value })}
                  placeholder="Ver oferta"
                />
              </div>
              <div className="space-y-2">
                <Label>Link do CTA</Label>
                <Input
                  value={form.cta_link}
                  onChange={(e) => setForm({ ...form, cta_link: e.target.value })}
                  placeholder="/pricing"
                />
              </div>
            </div>

            {/* Type & Variant */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as typeof form.type })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(typeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Variante</Label>
                <Select value={form.variant} onValueChange={(v) => setForm({ ...form, variant: v as typeof form.variant })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(variantLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Audiência</Label>
                <Select value={form.audience} onValueChange={(v) => setForm({ ...form, audience: v as typeof form.audience })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(audienceLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Pages */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Exibir em páginas (vírgula)</Label>
                <Input
                  value={form.pages}
                  onChange={(e) => setForm({ ...form, pages: e.target.value })}
                  placeholder="/, /blog, /pricing"
                />
                <p className="text-xs text-muted-foreground">Vazio = todas</p>
              </div>
              <div className="space-y-2">
                <Label>Excluir páginas (vírgula)</Label>
                <Input
                  value={form.exclude_pages}
                  onChange={(e) => setForm({ ...form, exclude_pages: e.target.value })}
                  placeholder="/mkt-admin"
                />
              </div>
            </div>

            {/* Scheduling */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Data início</Label>
                <Input
                  type="datetime-local"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Data fim</Label>
                <Input
                  type="datetime-local"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                />
              </div>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label>Prioridade (maior = aparece primeiro)</Label>
              <Input
                type="number"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 0 })}
              />
            </div>

            {/* Dismissible */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="dismissible"
                  checked={form.is_dismissible}
                  onCheckedChange={(checked) => setForm({ ...form, is_dismissible: checked })}
                />
                <Label htmlFor="dismissible">Permite fechar</Label>
              </div>
              {form.is_dismissible && (
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Reaparece após</Label>
                  <Input
                    type="number"
                    value={form.dismiss_duration_hours}
                    onChange={(e) => setForm({ ...form, dismiss_duration_hours: parseInt(e.target.value) || 24 })}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">horas</span>
                </div>
              )}
            </div>

            {/* Custom Colors (if custom variant) */}
            {form.variant === "custom" && (
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Cor de fundo</Label>
                  <Input
                    value={form.custom_bg_color}
                    onChange={(e) => setForm({ ...form, custom_bg_color: e.target.value })}
                    placeholder="#7610dc"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cor do texto</Label>
                  <Input
                    value={form.custom_text_color}
                    onChange={(e) => setForm({ ...form, custom_text_color: e.target.value })}
                    placeholder="#ffffff"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gradiente</Label>
                  <Input
                    value={form.custom_gradient}
                    onChange={(e) => setForm({ ...form, custom_gradient: e.target.value })}
                    placeholder="linear-gradient(...)"
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-4">
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                onClick={() => saveMutation.mutate()}
                disabled={!form.name || !form.title || saveMutation.isPending}
              >
                {saveMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir banner?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O banner será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
