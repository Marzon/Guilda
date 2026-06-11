import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Download, LayoutGrid, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import jsPDF from 'jspdf';
import { ToolPageLayout } from '@/components/tools/ToolPageLayout';
import { ToolTipsBox } from '@/components/tools/ToolHelpTooltip';
import { useToolTracking } from '@/hooks/useToolTracking';

interface CanvasData {
  keyPartners: string;
  keyActivities: string;
  keyResources: string;
  valuePropositions: string;
  customerRelationships: string;
  channels: string;
  customerSegments: string;
  costStructure: string;
  revenueStreams: string;
}

const BusinessModelCanvas = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { trackDownload, trackCalculation } = useToolTracking('business-model');
  const [canvas, setCanvas] = useState<CanvasData>({
    keyPartners: '',
    keyActivities: '',
    keyResources: '',
    valuePropositions: '',
    customerRelationships: '',
    channels: '',
    customerSegments: '',
    costStructure: '',
    revenueStreams: '',
  });

  const updateField = (field: keyof CanvasData, value: string) => {
    setCanvas(prev => ({ ...prev, [field]: value }));
  };

  // Track calculation when user modifies canvas fields
  useEffect(() => {
    const filledFields = Object.entries(canvas).filter(([_, v]) => v.trim() !== '').length;
    if (filledFields > 0) {
      trackCalculation({ filledFields, totalFields: 9 });
    }
  }, [canvas, trackCalculation]);

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFontSize(20);
    doc.text('Business Model Canvas', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(12);
    let y = 40;
    
    const sections = [
      { key: 'keyPartners', title: t('tools.business-model.fields.keyPartners') },
      { key: 'keyActivities', title: t('tools.business-model.fields.keyActivities') },
      { key: 'keyResources', title: t('tools.business-model.fields.keyResources') },
      { key: 'valuePropositions', title: t('tools.business-model.fields.valuePropositions') },
      { key: 'customerRelationships', title: t('tools.business-model.fields.customerRelationships') },
      { key: 'channels', title: t('tools.business-model.fields.channels') },
      { key: 'customerSegments', title: t('tools.business-model.fields.customerSegments') },
      { key: 'costStructure', title: t('tools.business-model.fields.costStructure') },
      { key: 'revenueStreams', title: t('tools.business-model.fields.revenueStreams') },
    ];

    sections.forEach(section => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.text(section.title, 20, y);
      doc.setFont('helvetica', 'normal');
      const content = canvas[section.key as keyof CanvasData] || '-';
      const lines = doc.splitTextToSize(content, pageWidth - 40);
      doc.text(lines, 20, y + 7);
      y += 10 + (lines.length * 5);
    });

    doc.save('business-model-canvas.pdf');
  };

  const hasData = Object.values(canvas).some(v => v.trim() !== '');

  return (
    <ToolPageLayout
      toolId="business-model"
      icon={LayoutGrid}
      iconColor="text-indigo-500"
      iconBgColor="bg-indigo-500/10"
    >
      <Helmet>
        <title>{t('tools.business-model.title')} | Guilda</title>
        <meta name="description" content={t('tools.business-model.description')} />
        <link rel="canonical" href="https://www.guilda.app.br/ferramentas-empreendedores/business-model" />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Canvas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {/* Row 1-2: Key Partners */}
          <Card className="md:row-span-2 border-2 border-indigo-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                🤝 {t('tools.business-model.fields.keyPartners')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder={t('tools.business-model.placeholders.keyPartners')}
                value={canvas.keyPartners}
                onChange={(e) => updateField('keyPartners', e.target.value)}
                className="min-h-[150px] resize-none"
              />
            </CardContent>
          </Card>

          {/* Row 1: Key Activities */}
          <Card className="border-2 border-indigo-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                ⚙️ {t('tools.business-model.fields.keyActivities')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder={t('tools.business-model.placeholders.keyActivities')}
                value={canvas.keyActivities}
                onChange={(e) => updateField('keyActivities', e.target.value)}
                className="min-h-[60px] resize-none"
              />
            </CardContent>
          </Card>

          {/* Row 1-2: Value Propositions */}
          <Card className="md:row-span-2 border-2 border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                💎 {t('tools.business-model.fields.valuePropositions')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder={t('tools.business-model.placeholders.valuePropositions')}
                value={canvas.valuePropositions}
                onChange={(e) => updateField('valuePropositions', e.target.value)}
                className="min-h-[150px] resize-none"
              />
            </CardContent>
          </Card>

          {/* Row 1: Customer Relationships */}
          <Card className="border-2 border-indigo-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                ❤️ {t('tools.business-model.fields.customerRelationships')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder={t('tools.business-model.placeholders.customerRelationships')}
                value={canvas.customerRelationships}
                onChange={(e) => updateField('customerRelationships', e.target.value)}
                className="min-h-[60px] resize-none"
              />
            </CardContent>
          </Card>

          {/* Row 1-2: Customer Segments */}
          <Card className="md:row-span-2 border-2 border-indigo-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                👥 {t('tools.business-model.fields.customerSegments')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder={t('tools.business-model.placeholders.customerSegments')}
                value={canvas.customerSegments}
                onChange={(e) => updateField('customerSegments', e.target.value)}
                className="min-h-[150px] resize-none"
              />
            </CardContent>
          </Card>

          {/* Row 2: Key Resources */}
          <Card className="border-2 border-indigo-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                🏭 {t('tools.business-model.fields.keyResources')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder={t('tools.business-model.placeholders.keyResources')}
                value={canvas.keyResources}
                onChange={(e) => updateField('keyResources', e.target.value)}
                className="min-h-[60px] resize-none"
              />
            </CardContent>
          </Card>

          {/* Row 2: Channels */}
          <Card className="border-2 border-indigo-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                📦 {t('tools.business-model.fields.channels')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder={t('tools.business-model.placeholders.channels')}
                value={canvas.channels}
                onChange={(e) => updateField('channels', e.target.value)}
                className="min-h-[60px] resize-none"
              />
            </CardContent>
          </Card>

          {/* Row 3: Cost Structure */}
          <Card className="md:col-span-2 border-2 border-red-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                💰 {t('tools.business-model.fields.costStructure')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder={t('tools.business-model.placeholders.costStructure')}
                value={canvas.costStructure}
                onChange={(e) => updateField('costStructure', e.target.value)}
                className="min-h-[80px] resize-none"
              />
            </CardContent>
          </Card>

          {/* Row 3: Revenue Streams */}
          <Card className="md:col-span-3 border-2 border-emerald-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                💵 {t('tools.business-model.fields.revenueStreams')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder={t('tools.business-model.placeholders.revenueStreams')}
                value={canvas.revenueStreams}
                onChange={(e) => updateField('revenueStreams', e.target.value)}
                className="min-h-[80px] resize-none"
              />
            </CardContent>
          </Card>
        </div>

        {/* Tips & Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-amber-500/20 bg-amber-500/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                {t('tools.business-model.tips.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• {t('tools.business-model.tips.tip1')}</li>
                <li>• {t('tools.business-model.tips.tip2')}</li>
                <li>• {t('tools.business-model.tips.tip3')}</li>
                <li>• {t('tools.business-model.tips.tip4')}</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-black text-white border-0">
            <CardHeader>
              <CardTitle className="text-lg text-white">Ações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={() => {
                  generatePDF();
                  trackDownload('pdf');
                }} 
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white"
                disabled={!hasData}
              >
                <Download className="w-4 h-4 mr-2" />
                {t('tools.business-model.download')}
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-white/30 text-white bg-transparent hover:bg-white/10"
                onClick={() => navigate('/auth?view=signup')}
              >
                Encontrar Sócio
              </Button>
            </CardContent>
          </Card>

          <ToolTipsBox toolId="business-model" />
        </div>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-gray-50 border border-black/10 rounded-2xl">
          <p className="text-sm text-gray-500 text-center">
            ⚠️ {t("tools.business-model.disclaimer", "Este canvas é apenas para fins educacionais e de planejamento. Os resultados são indicativos e não substituem uma análise estratégica profissional.")}
          </p>
        </div>
      </div>
    </ToolPageLayout>
  );
};

export default BusinessModelCanvas;
