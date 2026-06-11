import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { FileText, Plus, Trash2, Download, ChevronRight, ChevronLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { jsPDF } from 'jspdf';
import { ToolPageLayout } from '@/components/tools/ToolPageLayout';
import { useToolTracking } from '@/hooks/useToolTracking';

interface AdminFounder {
  name: string;
  cpf: string;
}

interface VestingSchedule {
  percentage: number;
  period: string;
}

const ContractGenerator = () => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const { trackDownload } = useToolTracking('contract-generator');
  
  // Company data
  const [company, setCompany] = useState({
    name: '',
    cnpj: '',
    address: '',
  });

  // Admin founders (original owners)
  const [adminFounders, setAdminFounders] = useState<AdminFounder[]>([
    { name: '', cpf: '' },
    { name: '', cpf: '' },
  ]);

  // Beneficiary data
  const [beneficiary, setBeneficiary] = useState({
    name: '',
    nationality: '',
    maritalStatus: '',
    profession: '',
    cpf: '',
    address: '',
  });

  // Vesting settings
  const [vestingSettings, setVestingSettings] = useState({
    totalEquity: 10,
    schedules: [
      { percentage: 25, period: '12 meses' },
      { percentage: 25, period: '24 meses' },
      { percentage: 25, period: '36 meses' },
      { percentage: 25, period: '48 meses' },
    ] as VestingSchedule[],
    conditions: '',
    minControlPercentage: 51,
  });

  // Contract settings
  const [settings, setSettings] = useState({
    nonCompeteYears: '2',
    nonCompete: true,
    confidentiality: true,
    jurisdiction: '',
    contractDate: '',
    numberOfCopies: '2',
    numberOfWitnesses: '2',
  });

  // Witnesses
  const [witnesses, setWitnesses] = useState([
    { name: '', cpf: '' },
    { name: '', cpf: '' },
  ]);

  const addAdminFounder = () => {
    if (adminFounders.length < 4) {
      setAdminFounders([...adminFounders, { name: '', cpf: '' }]);
    }
  };

  const removeAdminFounder = (index: number) => {
    if (adminFounders.length > 1) {
      setAdminFounders(adminFounders.filter((_, i) => i !== index));
    }
  };

  const updateAdminFounder = (index: number, field: keyof AdminFounder, value: string) => {
    const updated = [...adminFounders];
    updated[index] = { ...updated[index], [field]: value };
    setAdminFounders(updated);
  };

  const addVestingSchedule = () => {
    if (vestingSettings.schedules.length < 6) {
      setVestingSettings({
        ...vestingSettings,
        schedules: [...vestingSettings.schedules, { percentage: 0, period: '' }],
      });
    }
  };

  const removeVestingSchedule = (index: number) => {
    if (vestingSettings.schedules.length > 1) {
      setVestingSettings({
        ...vestingSettings,
        schedules: vestingSettings.schedules.filter((_, i) => i !== index),
      });
    }
  };

  const updateVestingSchedule = (index: number, field: keyof VestingSchedule, value: string | number) => {
    const updated = [...vestingSettings.schedules];
    updated[index] = { ...updated[index], [field]: value };
    setVestingSettings({ ...vestingSettings, schedules: updated });
  };

  const totalVestingPercentage = vestingSettings.schedules.reduce((sum, s) => sum + (s.percentage || 0), 0);

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;
    const lineHeight = 6;
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;

    const addText = (text: string, fontSize: number = 11, bold: boolean = false, align: 'left' | 'center' | 'justify' = 'left') => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      const lines = doc.splitTextToSize(text, maxWidth);
      lines.forEach((line: string) => {
        if (y > 275) {
          doc.addPage();
          y = 20;
        }
        if (align === 'center') {
          doc.text(line, pageWidth / 2, y, { align: 'center' });
        } else {
          doc.text(line, margin, y);
        }
        y += lineHeight;
      });
    };

    const addSection = (title: string) => {
      y += 4;
      addText(title, 12, true);
      y += 2;
    };

    const addClause = (title: string, content: string) => {
      y += 4;
      addText(title, 11, true);
      y += 1;
      addText(content, 10);
    };

    // Header
    addText('CONTRATO DE VESTING', 16, true, 'center');
    y += 8;

    // Party identification
    addSection(t('contract.pdf.partyIdentification'));
    addText(t('contract.pdf.introText'));
    y += 4;

    // Company
    const foundersText = adminFounders.map((f) => `${f.name}, CPF nº ${f.cpf}`).join(', e ');
    addText(`${company.name}, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº ${company.cnpj}, com sede à ${company.address}, neste ato representada por seus sócios-administradores ${foundersText}, doravante denominada simplesmente "EMPRESA";`);
    y += 4;

    addText(t('contract.pdf.andOtherSide'));
    y += 4;

    // Beneficiary
    addText(`${beneficiary.name}, ${beneficiary.nationality}, ${beneficiary.maritalStatus}, ${beneficiary.profession}, inscrito no CPF sob o nº ${beneficiary.cpf}, residente e domiciliado à ${beneficiary.address}, doravante denominado "BENEFICIÁRIO";`);
    y += 4;

    addText(t('contract.pdf.agreementIntro'));
    y += 6;

    // Clause 1 - Object
    addClause(t('contract.pdf.clause1Title'), t('contract.pdf.clause1Content'));

    // Clause 2 - Vesting Rules
    addClause(t('contract.pdf.clause2Title'), '');
    addText(`1. ${t('contract.pdf.gradualGrant')}: ${t('contract.pdf.beneficiaryWillHave')} ${vestingSettings.totalEquity}% ${t('contract.pdf.equityParticipation')}:`);
    y += 2;
    vestingSettings.schedules.forEach((schedule) => {
      addText(`   • ${schedule.percentage}% ${t('contract.pdf.after')} ${schedule.period};`);
    });
    y += 2;

    addText(`2. ${t('contract.pdf.conditionalities')}: ${vestingSettings.conditions || t('contract.pdf.defaultConditions')}`);
    y += 2;

    addText(`3. ${t('contract.pdf.lossOfRights')}: ${t('contract.pdf.lossOfRightsContent')}`);

    // Clause 3 - Protection of Original Owners
    addClause(t('contract.pdf.clause3Title'), '');
    addText(`1. ${t('contract.pdf.controlPreservation')}: ${t('contract.pdf.controlPreservationContent').replace('{{percentage}}', String(vestingSettings.minControlPercentage))}`);
    y += 2;
    addText(`2. ${t('contract.pdf.votingRestrictions')}: ${t('contract.pdf.votingRestrictionsContent')}`);

    // Clause 4 - Non-Compete and Confidentiality
    if (settings.nonCompete || settings.confidentiality) {
      addClause(t('contract.pdf.clause4Title'), '');
      if (settings.nonCompete) {
        addText(`1. ${t('contract.pdf.nonCompeteContent').replace('{{years}}', settings.nonCompeteYears)}`);
        y += 2;
      }
      if (settings.confidentiality) {
        addText(`${settings.nonCompete ? '2' : '1'}. ${t('contract.pdf.confidentialityContent')}`);
      }
    }

    // Clause 5 - Termination
    addClause(t('contract.pdf.clause5Title'), '');
    addText(`1. ${t('contract.pdf.terminationIntro')}:`);
    addText(`   • ${t('contract.pdf.terminationReason1')};`);
    addText(`   • ${t('contract.pdf.terminationReason2')};`);
    addText(`   • ${t('contract.pdf.terminationReason3')}.`);
    y += 2;
    addText(`2. ${t('contract.pdf.terminationConsequence')}`);

    // Clause 6 - Final Provisions
    addClause(t('contract.pdf.clause6Title'), '');
    addText(`1. ${t('contract.pdf.irrevocable')}`);
    y += 2;
    addText(`2. ${t('contract.pdf.jurisdictionContent').replace('{{city}}', settings.jurisdiction)}`);
    y += 6;

    // Closing
    addText(t('contract.pdf.closingText').replace('{{copies}}', settings.numberOfCopies).replace('{{witnesses}}', settings.numberOfWitnesses));
    y += 4;

    const formattedDate = settings.contractDate 
      ? new Date(settings.contractDate).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
      : '[data]';
    addText(`${settings.jurisdiction}, ${formattedDate}.`);
    y += 12;

    // Signatures - Company
    addText('EMPRESA', 11, true, 'center');
    y += 2;
    addText(company.name, 10, false, 'center');
    y += 8;

    adminFounders.forEach((founder) => {
      doc.line(margin + 30, y, pageWidth - margin - 30, y);
      y += 4;
      addText(founder.name, 10, false, 'center');
      addText(`CPF: ${founder.cpf}`, 9, false, 'center');
      y += 6;
    });

    // Signature - Beneficiary
    y += 4;
    addText('BENEFICIÁRIO', 11, true, 'center');
    y += 8;
    doc.line(margin + 30, y, pageWidth - margin - 30, y);
    y += 4;
    addText(beneficiary.name, 10, false, 'center');
    addText(`CPF: ${beneficiary.cpf}`, 9, false, 'center');

    // Witnesses
    y += 10;
    addText('TESTEMUNHAS', 11, true, 'center');
    y += 6;

    witnesses.forEach((witness, index) => {
      doc.line(margin + 30, y, pageWidth - margin - 30, y);
      y += 4;
      addText(`${index + 1}. ${witness.name || '[Nome]'}`, 10, false, 'center');
      addText(`CPF: ${witness.cpf || '[CPF]'}`, 9, false, 'center');
      y += 6;
    });

    // Disclaimer
    y += 8;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    const disclaimer = doc.splitTextToSize(t('contract.disclaimer'), maxWidth);
    disclaimer.forEach((line: string) => {
      if (y > 285) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, margin, y);
      y += 4;
    });

    // Source reference
    y += 4;
    doc.setFontSize(7);
    doc.text('Fonte: JusBrasil - Modelo adaptado de contrato de vesting', margin, y);

    const fileName = `contrato-vesting-${beneficiary.name.replace(/\s+/g, '-').toLowerCase() || 'beneficiario'}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  const totalSteps = 5;

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Card className="border-2">
            <CardHeader>
              <CardTitle>{t('contract.step1.title')}</CardTitle>
              <CardDescription>{t('contract.step1.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="companyName">{t('contract.companyName')} *</Label>
                <Input
                  id="companyName"
                  value={company.name}
                  onChange={(e) => setCompany({ ...company, name: e.target.value })}
                  placeholder="Empresa ABC Ltda."
                  maxLength={100}
                />
              </div>
              <div>
                <Label htmlFor="cnpj">CNPJ *</Label>
                <Input
                  id="cnpj"
                  value={company.cnpj}
                  onChange={(e) => setCompany({ ...company, cnpj: e.target.value })}
                  placeholder="00.000.000/0001-00"
                  maxLength={18}
                />
              </div>
              <div>
                <Label htmlFor="address">{t('contract.address')} *</Label>
                <Input
                  id="address"
                  value={company.address}
                  onChange={(e) => setCompany({ ...company, address: e.target.value })}
                  placeholder={t('contract.addressPlaceholder')}
                  maxLength={200}
                />
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-base font-medium">{t('contract.adminFounders')}</Label>
                  {adminFounders.length < 4 && (
                    <Button variant="outline" size="sm" onClick={addAdminFounder}>
                      <Plus className="w-4 h-4 mr-1" />
                      {t('contract.addAdmin')}
                    </Button>
                  )}
                </div>
                
                {adminFounders.map((founder, index) => (
                  <div key={index} className="p-3 border rounded-lg mb-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t('contract.admin')} {index + 1}</span>
                      {adminFounders.length > 1 && (
                        <Button variant="ghost" size="sm" onClick={() => removeAdminFounder(index)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label>{t('contract.founderName')} *</Label>
                        <Input
                          value={founder.name}
                          onChange={(e) => updateAdminFounder(index, 'name', e.target.value)}
                          placeholder={t('contract.founderNamePlaceholder')}
                          maxLength={100}
                        />
                      </div>
                      <div>
                        <Label>CPF *</Label>
                        <Input
                          value={founder.cpf}
                          onChange={(e) => updateAdminFounder(index, 'cpf', e.target.value)}
                          placeholder="000.000.000-00"
                          maxLength={14}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card className="border-2">
            <CardHeader>
              <CardTitle>{t('contract.step2.title')}</CardTitle>
              <CardDescription>{t('contract.step2.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label>{t('contract.beneficiaryName')} *</Label>
                  <Input
                    value={beneficiary.name}
                    onChange={(e) => setBeneficiary({ ...beneficiary, name: e.target.value })}
                    placeholder={t('contract.founderNamePlaceholder')}
                    maxLength={100}
                  />
                </div>
                <div>
                  <Label>{t('contract.nationality')} *</Label>
                  <Input
                    value={beneficiary.nationality}
                    onChange={(e) => setBeneficiary({ ...beneficiary, nationality: e.target.value })}
                    placeholder={t('contract.nationalityPlaceholder')}
                    maxLength={50}
                  />
                </div>
                <div>
                  <Label>{t('contract.maritalStatus')} *</Label>
                  <Select value={beneficiary.maritalStatus} onValueChange={(v) => setBeneficiary({ ...beneficiary, maritalStatus: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('contract.selectMaritalStatus')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solteiro(a)">{t('contract.single')}</SelectItem>
                      <SelectItem value="casado(a)">{t('contract.married')}</SelectItem>
                      <SelectItem value="divorciado(a)">{t('contract.divorced')}</SelectItem>
                      <SelectItem value="viúvo(a)">{t('contract.widowed')}</SelectItem>
                      <SelectItem value="união estável">{t('contract.domesticPartnership')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t('contract.profession')} *</Label>
                  <Input
                    value={beneficiary.profession}
                    onChange={(e) => setBeneficiary({ ...beneficiary, profession: e.target.value })}
                    placeholder={t('contract.professionPlaceholder')}
                    maxLength={50}
                  />
                </div>
                <div>
                  <Label>CPF *</Label>
                  <Input
                    value={beneficiary.cpf}
                    onChange={(e) => setBeneficiary({ ...beneficiary, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                    maxLength={14}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>{t('contract.address')} *</Label>
                  <Input
                    value={beneficiary.address}
                    onChange={(e) => setBeneficiary({ ...beneficiary, address: e.target.value })}
                    placeholder={t('contract.addressPlaceholder')}
                    maxLength={200}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card className="border-2">
            <CardHeader>
              <CardTitle>{t('contract.step3.title')}</CardTitle>
              <CardDescription>{t('contract.step3.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>{t('contract.totalEquityGrant')} (%)</Label>
                <Input
                  type="number"
                  value={vestingSettings.totalEquity}
                  onChange={(e) => setVestingSettings({ ...vestingSettings, totalEquity: Number(e.target.value) })}
                  min={1}
                  max={49}
                />
                <p className="text-xs text-muted-foreground mt-1">{t('contract.totalEquityHint')}</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-base">{t('contract.vestingSchedule')}</Label>
                  {vestingSettings.schedules.length < 6 && (
                    <Button variant="outline" size="sm" onClick={addVestingSchedule}>
                      <Plus className="w-4 h-4 mr-1" />
                      {t('contract.addPeriod')}
                    </Button>
                  )}
                </div>
                
                {vestingSettings.schedules.map((schedule, index) => (
                  <div key={index} className="flex items-center gap-3 mb-2">
                    <div className="flex-1">
                      <Input
                        type="number"
                        value={schedule.percentage}
                        onChange={(e) => updateVestingSchedule(index, 'percentage', Number(e.target.value))}
                        min={0}
                        max={100}
                        placeholder="%"
                      />
                    </div>
                    <span className="text-muted-foreground">% {t('contract.after')}</span>
                    <div className="flex-1">
                      <Input
                        value={schedule.period}
                        onChange={(e) => updateVestingSchedule(index, 'period', e.target.value)}
                        placeholder={t('contract.periodPlaceholder')}
                        maxLength={30}
                      />
                    </div>
                    {vestingSettings.schedules.length > 1 && (
                      <Button variant="ghost" size="sm" onClick={() => removeVestingSchedule(index)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
                
                <div className={`text-sm mt-2 ${totalVestingPercentage === 100 ? 'text-green-500' : 'text-amber-500'}`}>
                  {t('contract.totalSchedule')}: {totalVestingPercentage}% {totalVestingPercentage !== 100 && `(${t('contract.shouldBe100')})`}
                </div>
              </div>

              <div>
                <Label>{t('contract.vestingConditions')}</Label>
                <Textarea
                  value={vestingSettings.conditions}
                  onChange={(e) => setVestingSettings({ ...vestingSettings, conditions: e.target.value })}
                  placeholder={t('contract.vestingConditionsPlaceholder')}
                  rows={3}
                  maxLength={500}
                />
              </div>

              <div>
                <Label>{t('contract.minControlPercentage')} (%)</Label>
                <Input
                  type="number"
                  value={vestingSettings.minControlPercentage}
                  onChange={(e) => setVestingSettings({ ...vestingSettings, minControlPercentage: Number(e.target.value) })}
                  min={50}
                  max={100}
                />
                <p className="text-xs text-muted-foreground mt-1">{t('contract.minControlHint')}</p>
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card className="border-2">
            <CardHeader>
              <CardTitle>{t('contract.step4.title')}</CardTitle>
              <CardDescription>{t('contract.step4.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t('contract.nonCompete')}</Label>
                    <p className="text-sm text-muted-foreground">{t('contract.nonCompeteDescription')}</p>
                  </div>
                  <Switch
                    checked={settings.nonCompete}
                    onCheckedChange={(v) => setSettings({ ...settings, nonCompete: v })}
                  />
                </div>
                {settings.nonCompete && (
                  <div>
                    <Label>{t('contract.nonCompeteDuration')}</Label>
                    <Select value={settings.nonCompeteYears} onValueChange={(v) => setSettings({ ...settings, nonCompeteYears: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((y) => (
                          <SelectItem key={y} value={String(y)}>{y} {t('contract.years')}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t('contract.confidentiality')}</Label>
                    <p className="text-sm text-muted-foreground">{t('contract.confidentialityDescription')}</p>
                  </div>
                  <Switch
                    checked={settings.confidentiality}
                    onCheckedChange={(v) => setSettings({ ...settings, confidentiality: v })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <Label>{t('contract.forum')} *</Label>
                  <Input
                    value={settings.jurisdiction}
                    onChange={(e) => setSettings({ ...settings, jurisdiction: e.target.value })}
                    placeholder={t('contract.forumPlaceholder')}
                    maxLength={50}
                  />
                </div>
                <div>
                  <Label>{t('contract.contractDate')} *</Label>
                  <Input
                    type="date"
                    value={settings.contractDate}
                    onChange={(e) => setSettings({ ...settings, contractDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{t('contract.numberOfCopies')}</Label>
                  <Select value={settings.numberOfCopies} onValueChange={(v) => setSettings({ ...settings, numberOfCopies: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2, 3, 4].map((n) => (
                        <SelectItem key={n} value={String(n)}>{n} {t('contract.copies')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t('contract.numberOfWitnesses')}</Label>
                  <Select value={settings.numberOfWitnesses} onValueChange={(v) => {
                    setSettings({ ...settings, numberOfWitnesses: v });
                    const numWitnesses = Number(v);
                    if (numWitnesses > witnesses.length) {
                      setWitnesses([...witnesses, ...Array(numWitnesses - witnesses.length).fill({ name: '', cpf: '' })]);
                    } else {
                      setWitnesses(witnesses.slice(0, numWitnesses));
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2, 3].map((n) => (
                        <SelectItem key={n} value={String(n)}>{n} {t('contract.witnesses')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Label className="text-base font-medium mb-3 block">{t('contract.witnessesData')} ({t('common.optional')})</Label>
                {witnesses.map((witness, index) => (
                  <div key={index} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div>
                      <Label className="text-sm">{t('contract.witness')} {index + 1} - {t('contract.founderName')}</Label>
                      <Input
                        value={witness.name}
                        onChange={(e) => {
                          const updated = [...witnesses];
                          updated[index] = { ...updated[index], name: e.target.value };
                          setWitnesses(updated);
                        }}
                        placeholder={t('contract.founderNamePlaceholder')}
                        maxLength={100}
                      />
                    </div>
                    <div>
                      <Label className="text-sm">CPF</Label>
                      <Input
                        value={witness.cpf}
                        onChange={(e) => {
                          const updated = [...witnesses];
                          updated[index] = { ...updated[index], cpf: e.target.value };
                          setWitnesses(updated);
                        }}
                        placeholder="000.000.000-00"
                        maxLength={14}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case 5:
        return (
          <Card className="border-2">
            <CardHeader>
              <CardTitle>{t('contract.step5.title')}</CardTitle>
              <CardDescription>{t('contract.step5.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">{t('contract.section.company')}</h4>
                <p><strong>{company.name}</strong></p>
                <p className="text-sm">CNPJ: {company.cnpj}</p>
                <p className="text-sm text-muted-foreground">{company.address}</p>
                <div className="mt-2 text-sm">
                  <strong>{t('contract.adminFounders')}:</strong>
                  {adminFounders.map((f, i) => (
                    <p key={i}>{f.name} (CPF: {f.cpf})</p>
                  ))}
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">{t('contract.beneficiary')}</h4>
                <p><strong>{beneficiary.name}</strong></p>
                <p className="text-sm">{beneficiary.nationality}, {beneficiary.maritalStatus}, {beneficiary.profession}</p>
                <p className="text-sm">CPF: {beneficiary.cpf}</p>
                <p className="text-sm text-muted-foreground">{beneficiary.address}</p>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">{t('contract.section.vesting')}</h4>
                <p>{t('contract.totalEquityGrant')}: <strong>{vestingSettings.totalEquity}%</strong></p>
                <div className="mt-2 text-sm">
                  {vestingSettings.schedules.map((s, i) => (
                    <p key={i}>• {s.percentage}% {t('contract.after')} {s.period}</p>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {t('contract.minControlPercentage')}: {vestingSettings.minControlPercentage}%
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">{t('contract.section.clauses')}</h4>
                {settings.nonCompete && <p className="text-sm">• {t('contract.nonCompete')}: {settings.nonCompeteYears} {t('contract.years')}</p>}
                {settings.confidentiality && <p className="text-sm">• {t('contract.confidentiality')}: ✓</p>}
                <p className="text-sm">• {t('contract.forum')}: {settings.jurisdiction}</p>
                <p className="text-sm">• {t('contract.contractDate')}: {settings.contractDate ? new Date(settings.contractDate).toLocaleDateString('pt-BR') : '-'}</p>
              </div>

              <Alert>
                <AlertDescription>
                  {t('contract.disclaimer')}
                </AlertDescription>
              </Alert>

              <div className="text-center text-xs text-muted-foreground">
                <a 
                  href="https://www.jusbrasil.com.br/modelos-pecas/modelo-de-contrato-de-vesting/2992121911" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:underline"
                >
                  {t('contract.sourceTemplate')}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <Button 
                onClick={() => {
                  generatePDF();
                  trackDownload('pdf');
                }} 
                className="w-full bg-blue-500 hover:bg-blue-600" 
                size="lg"
              >
                <Download className="w-4 h-4 mr-2" />
                {t('contract.downloadPDF')}
              </Button>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>{t('contract.pageTitle')} | Guilda</title>
        <meta name="description" content={t('contract.pageDescription')} />
        <meta name="keywords" content="contrato vesting, modelo contrato vesting, acordo vesting startup, equity vesting gratuito" />
        <link rel="canonical" href="https://www.guilda.app.br/ferramentas-empreendedores/contract-generator" />
      </Helmet>

      <ToolPageLayout toolId="contract-generator" icon={FileText} iconColor="text-blue-500" iconBgColor="bg-blue-500/10">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          {/* Progress */}
          <Card className="mb-8 bg-black text-white border-0">
            <CardContent className="pt-6">
              <div className="flex justify-center flex-wrap gap-1">
                {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
                  <div key={s} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= s ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-400'
                    }`}>
                      {s}
                    </div>
                    {s < totalSteps && <div className={`w-4 sm:w-8 h-1 ${step > s ? 'bg-blue-500' : 'bg-slate-700'}`} />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {renderStep()}

          {/* Disclaimer */}
          <div className="mt-6 p-4 bg-gray-50 border border-black/10 rounded-2xl">
            <p className="text-sm text-gray-500 text-center">
              ⚠️ {t("tools.contract-generator.disclaimer", "Este modelo de contrato é apenas para fins educacionais e não substitui consultoria jurídica profissional. Sempre consulte um advogado antes de assinar documentos legais.")}
            </p>
          </div>

          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              {t('common.back')}
            </Button>
            {step < totalSteps ? (
              <Button onClick={() => setStep(step + 1)}>
                {t('common.next')}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : null}
          </div>
        </div>
      </ToolPageLayout>
    </>
  );
};

export default ContractGenerator;