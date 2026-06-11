import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { Shield, Lock, Eye, Database, UserCheck, Mail, Calendar } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { LandingDarkNavbar } from "@/components/landing/LandingDarkNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { SocialPaymentBanner } from "@/components/monetization/SocialPaymentBanner";

const Privacy = () => {
  const { t } = useTranslation();

  const sections = [
    { id: "data-collected", icon: Database, title: t("privacy.sections.dataCollected.title"), content: t("privacy.sections.dataCollected.content") },
    { id: "purpose", icon: Eye, title: t("privacy.sections.purpose.title"), content: t("privacy.sections.purpose.content") },
    { id: "legal-basis", icon: UserCheck, title: t("privacy.sections.legalBasis.title"), content: t("privacy.sections.legalBasis.content") },
    { id: "third-parties", icon: Lock, title: t("privacy.sections.thirdParties.title"), content: t("privacy.sections.thirdParties.content") },
    { id: "user-rights", icon: Shield, title: t("privacy.sections.userRights.title"), content: t("privacy.sections.userRights.content") },
    { id: "cookies", icon: Database, title: t("privacy.sections.cookies.title"), content: t("privacy.sections.cookies.content") },
    { id: "retention", icon: Calendar, title: t("privacy.sections.retention.title"), content: t("privacy.sections.retention.content") },
    { id: "contact", icon: Mail, title: t("privacy.sections.contact.title"), content: t("privacy.sections.contact.content") },
  ];

  return (
    <>
      <Helmet>
        <title>{t("privacy.meta.title")}</title>
        <meta name="description" content={t("privacy.meta.description")} />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-white">
        <LandingDarkNavbar />
        <SocialPaymentBanner />

        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 pt-24">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#7610DC]/10 mb-6">
              <Shield className="w-7 h-7 text-[#7610DC]" />
            </div>
            <h1
              className="text-[1.75rem] sm:text-4xl md:text-5xl font-serif font-thin leading-[0.9] tracking-tight text-black mb-4"
              style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}
            >
              {t("privacy.title")}
            </h1>
            <p className="text-gray-400 text-sm">
              {t("privacy.lastUpdated")}: 09/12/2025
            </p>
          </div>

          <div className="mb-8">
            <p className="text-gray-500 leading-relaxed">
              {t("privacy.intro")}
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

export default Privacy;
