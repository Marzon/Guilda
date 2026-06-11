import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { FileText, Users, AlertTriangle, Scale, Shield, Edit, Gavel, Mail } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { LandingDarkNavbar } from "@/components/landing/LandingDarkNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { SocialPaymentBanner } from "@/components/monetization/SocialPaymentBanner";

const Terms = () => {
  const { t } = useTranslation();

  const sections = [
    { id: "acceptance", icon: FileText, title: t("terms.sections.acceptance.title"), content: t("terms.sections.acceptance.content") },
    { id: "service", icon: Users, title: t("terms.sections.service.title"), content: t("terms.sections.service.content") },
    { id: "eligibility", icon: Users, title: t("terms.sections.eligibility.title"), content: t("terms.sections.eligibility.content") },
    { id: "account", icon: Shield, title: t("terms.sections.account.title"), content: t("terms.sections.account.content") },
    { id: "conduct", icon: AlertTriangle, title: t("terms.sections.conduct.title"), content: t("terms.sections.conduct.content") },
    { id: "intellectual", icon: Scale, title: t("terms.sections.intellectual.title"), content: t("terms.sections.intellectual.content") },
    { id: "liability", icon: Shield, title: t("terms.sections.liability.title"), content: t("terms.sections.liability.content") },
    { id: "modifications", icon: Edit, title: t("terms.sections.modifications.title"), content: t("terms.sections.modifications.content") },
    { id: "jurisdiction", icon: Gavel, title: t("terms.sections.jurisdiction.title"), content: t("terms.sections.jurisdiction.content") },
    { id: "contact", icon: Mail, title: t("terms.sections.contact.title"), content: t("terms.sections.contact.content") },
  ];

  return (
    <>
      <Helmet>
        <title>{t("terms.meta.title")}</title>
        <meta name="description" content={t("terms.meta.description")} />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-white">
        <LandingDarkNavbar />
        <SocialPaymentBanner />

        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 pt-24">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#7610DC]/10 mb-6">
              <FileText className="w-7 h-7 text-[#7610DC]" />
            </div>
            <h1
              className="text-[1.75rem] sm:text-4xl md:text-5xl font-serif font-thin leading-[0.9] tracking-tight text-black mb-4"
              style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}
            >
              {t("terms.title")}
            </h1>
            <p className="text-gray-400 text-sm">
              {t("terms.lastUpdated")}: 09/12/2025
            </p>
          </div>

          <div className="mb-8">
            <p className="text-gray-500 leading-relaxed">
              {t("terms.intro")}
            </p>
          </div>

          <Accordion type="multiple" className="space-y-3">
            {sections.map((section) => (
              <AccordionItem
                key={section.id}
                value={section.id}
                className="border border-black/10 rounded-2xl px-4 bg-white"
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-[#7610DC]/10">
                      <section.icon className="w-5 h-5 text-[#7610DC]" />
                    </div>
                    <span className="font-semibold text-black">
                      {section.title}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-gray-500 whitespace-pre-line pb-4">
                  {section.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </main>

        <LandingFooter />
      </div>
    </>
  );
};

export default Terms;
