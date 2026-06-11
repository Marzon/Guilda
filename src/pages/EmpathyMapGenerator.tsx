import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Download, Users, Eye, Ear, MessageSquare, Heart, Frown, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import jsPDF from 'jspdf';
import { ToolPageLayout } from '@/components/tools/ToolPageLayout';
import { ToolTipsBox } from '@/components/tools/ToolHelpTooltip';
import { useToolTracking } from '@/hooks/useToolTracking';

interface EmpathyMapData {
  personaName: string;
  personaRole: string;
  thinks: string;
  feels: string;
  sees: string;
  hears: string;
  says: string;
  does: string;
  pains: string;
  gains: string;
}

const EmpathyMapGenerator = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { trackDownload, trackCalculation } = useToolTracking('empathy-map');
  const [map, setMap] = useState<EmpathyMapData>({
    personaName: '',
    personaRole: '',
    thinks: '',
    feels: '',
    sees: '',
    hears: '',
    says: '',
    does: '',
    pains: '',
    gains: '',
  });

  const updateField = (field: keyof EmpathyMapData, value: string) => {
    setMap(prev => ({ ...prev, [field]: value }));
  };

  // Track calculation when user modifies empathy map fields
  useEffect(() => {
    const filledFields = Object.entries(map).filter(([_, v]) => v.trim() !== '').length;
    if (filledFields > 0) {
      trackCalculation({ filledFields, totalFields: 10, personaName: map.personaName });
    }
  }, [map, trackCalculation]);

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFontSize(20);
    doc.text(t('tools.empathy-map.title'), pageWidth / 2, 20, { align: 'center' });
    
    if (map.personaName) {
      doc.setFontSize(14);
      doc.text(`${map.personaName}${map.personaRole ? ` - ${map.personaRole}` : ''}`, pageWidth / 2, 30, { align: 'center' });
    }
    
    doc.setFontSize(12);
    let y = 45;
    
    const sections = [
      { key: 'thinks', title: t('tools.empathy-map.fields.thinks') },
      { key: 'feels', title: t('tools.empathy-map.fields.feels') },
      { key: 'sees', title: t('tools.empathy-map.fields.sees') },
      { key: 'hears', title: t('tools.empathy-map.fields.hears') },
      { key: 'says', title: t('tools.empathy-map.fields.says') },
      { key: 'does', title: t('tools.empathy-map.fields.does') },
      { key: 'pains', title: t('tools.empathy-map.fields.pains') },
      { key: 'gains', title: t('tools.empathy-map.fields.gains') },
    ];

    sections.forEach(section => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.text(section.title, 20, y);
      doc.setFont('helvetica', 'normal');
      const content = map[section.key as keyof EmpathyMapData] || '-';
      const lines = doc.splitTextToSize(content, pageWidth - 40);
      doc.text(lines, 20, y + 7);
      y += 10 + (lines.length * 5);
    });

    doc.save(`empathy-map-${map.personaName || 'persona'}.pdf`);
  };

  const hasData = Object.values(map).some(v => v.trim() !== '');

  return (
    <ToolPageLayout
      toolId="empathy-map"
      icon={Users}
      iconColor="text-pink-500"
      iconBgColor="bg-pink-500/10"
    >
      <Helmet>
        <title>{t('tools.empathy-map.title')} | Guilda</title>
        <meta name="description" content={t('tools.empathy-map.description')} />
        <link rel="canonical" href="https://www.guilda.app.br/ferramentas-empreendedores/empathy-map" />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Inputs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Persona Info */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg">{t('tools.empathy-map.persona.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>{t('tools.empathy-map.persona.name')}</Label>
                    <Input
                      placeholder={t('tools.empathy-map.persona.namePlaceholder')}
                      value={map.personaName}
                      onChange={(e) => updateField('personaName', e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>{t('tools.empathy-map.persona.role')}</Label>
                    <Input
                      placeholder={t('tools.empathy-map.persona.rolePlaceholder')}
                      value={map.personaRole}
                      onChange={(e) => updateField('personaRole', e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Empathy Map Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Thinks & Feels */}
              <Card className="border-2 border-purple-500/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Heart className="w-4 h-4 text-purple-500" />
                    {t('tools.empathy-map.fields.thinks')} & {t('tools.empathy-map.fields.feels')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">{t('tools.empathy-map.fields.thinks')}</Label>
                    <Textarea
                      placeholder={t('tools.empathy-map.placeholders.thinks')}
                      value={map.thinks}
                      onChange={(e) => updateField('thinks', e.target.value)}
                      className="min-h-[80px] resize-none mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">{t('tools.empathy-map.fields.feels')}</Label>
                    <Textarea
                      placeholder={t('tools.empathy-map.placeholders.feels')}
                      value={map.feels}
                      onChange={(e) => updateField('feels', e.target.value)}
                      className="min-h-[80px] resize-none mt-1"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Sees */}
              <Card className="border-2 border-blue-500/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-500" />
                    {t('tools.empathy-map.fields.sees')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder={t('tools.empathy-map.placeholders.sees')}
                    value={map.sees}
                    onChange={(e) => updateField('sees', e.target.value)}
                    className="min-h-[170px] resize-none"
                  />
                </CardContent>
              </Card>

              {/* Hears */}
              <Card className="border-2 border-amber-500/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Ear className="w-4 h-4 text-amber-500" />
                    {t('tools.empathy-map.fields.hears')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder={t('tools.empathy-map.placeholders.hears')}
                    value={map.hears}
                    onChange={(e) => updateField('hears', e.target.value)}
                    className="min-h-[100px] resize-none"
                  />
                </CardContent>
              </Card>

              {/* Says & Does */}
              <Card className="border-2 border-emerald-500/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-500" />
                    {t('tools.empathy-map.fields.says')} & {t('tools.empathy-map.fields.does')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">{t('tools.empathy-map.fields.says')}</Label>
                    <Textarea
                      placeholder={t('tools.empathy-map.placeholders.says')}
                      value={map.says}
                      onChange={(e) => updateField('says', e.target.value)}
                      className="min-h-[60px] resize-none mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">{t('tools.empathy-map.fields.does')}</Label>
                    <Textarea
                      placeholder={t('tools.empathy-map.placeholders.does')}
                      value={map.does}
                      onChange={(e) => updateField('does', e.target.value)}
                      className="min-h-[60px] resize-none mt-1"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pains & Gains */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-2 border-red-500/20 bg-red-500/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Frown className="w-4 h-4 text-red-500" />
                    {t('tools.empathy-map.fields.pains')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder={t('tools.empathy-map.placeholders.pains')}
                    value={map.pains}
                    onChange={(e) => updateField('pains', e.target.value)}
                    className="min-h-[120px] resize-none"
                  />
                </CardContent>
              </Card>

              <Card className="border-2 border-emerald-500/20 bg-emerald-500/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Smile className="w-4 h-4 text-emerald-500" />
                    {t('tools.empathy-map.fields.gains')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder={t('tools.empathy-map.placeholders.gains')}
                    value={map.gains}
                    onChange={(e) => updateField('gains', e.target.value)}
                    className="min-h-[120px] resize-none"
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="lg:sticky lg:top-20 h-fit">
            <Card className="bg-foreground text-background border-0">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-pink-400" />
                  {map.personaName || 'Sua Persona'}
                </CardTitle>
                {map.personaRole && (
                  <p className="text-sm text-background/60">{map.personaRole}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-purple-500/20">
                    <p className="text-xs text-purple-300">Pensa/Sente</p>
                    <p className="text-lg font-bold text-purple-400">{map.thinks || map.feels ? '✓' : '-'}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-500/20">
                    <p className="text-xs text-blue-300">Vê</p>
                    <p className="text-lg font-bold text-blue-400">{map.sees ? '✓' : '-'}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-500/20">
                    <p className="text-xs text-amber-300">Ouve</p>
                    <p className="text-lg font-bold text-amber-400">{map.hears ? '✓' : '-'}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-500/20">
                    <p className="text-xs text-emerald-300">Diz/Faz</p>
                    <p className="text-lg font-bold text-emerald-400">{map.says || map.does ? '✓' : '-'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-red-500/20">
                    <p className="text-xs text-red-300">Dores</p>
                    <p className="text-lg font-bold text-red-400">{map.pains ? '✓' : '-'}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-500/20">
                    <p className="text-xs text-green-300">Ganhos</p>
                    <p className="text-lg font-bold text-green-400">{map.gains ? '✓' : '-'}</p>
                  </div>
                </div>

                <Button 
                  onClick={() => {
                    generatePDF();
                    trackDownload('pdf');
                  }} 
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white"
                  disabled={!hasData}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t('tools.empathy-map.download')}
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full border-slate-500 text-white bg-slate-700 hover:bg-slate-600"
                  onClick={() => navigate('/auth?view=signup')}
                >
                  Encontrar Sócio
                </Button>
              </CardContent>
            </Card>

            <ToolTipsBox toolId="empathy-map" />
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-gray-50 border border-black/10 rounded-2xl">
          <p className="text-sm text-gray-500 text-center">
            ⚠️ {t("tools.empathy-map.disclaimer", "Este mapa de empatia é apenas para fins educacionais e de planejamento. Os resultados são indicativos e não substituem pesquisa de usuário profissional.")}
          </p>
        </div>
      </div>
    </ToolPageLayout>
  );
};

export default EmpathyMapGenerator;
