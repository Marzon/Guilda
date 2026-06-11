import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";

const accentColors = ["#7610DC", "#F97316", "#7610DC", "#F97316", "#7610DC"];

export const LandingFAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { t } = useTranslation();

  const faqs = useMemo(() => [
    { question: t('landing.faq.q1'), answer: t('landing.faq.a1') },
    { question: t('landing.faq.q2'), answer: t('landing.faq.a2') },
    { question: t('landing.faq.q3'), answer: t('landing.faq.a3') },
    { question: t('landing.faq.q4'), answer: t('landing.faq.a4') },
    { question: t('landing.faq.q5'), answer: t('landing.faq.a5') },
  ], [t]);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section className="py-12 sm:py-32 bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": { "@type": "Answer", "text": faq.answer }
        }))
      })}} />
      <div className="max-w-[720px] mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-14">
          <span className="inline-block text-[12px] font-bold uppercase tracking-[3px] text-[#7610DC] mb-4">FAQ</span>
          <h2
            className="text-[1.75rem] sm:text-4xl md:text-5xl font-serif font-thin leading-[0.9] tracking-tight text-black"
            style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}
          >
            {t('landing.faq.title')}
          </h2>
          <p className="text-base text-gray-500 mt-2">
            {t('landing.faq.description')}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            const accent = accentColors[i];
            return (
              <div key={i} className="bg-white rounded-xl border border-black/10 transition-colors duration-200 hover:bg-gray-50 cursor-pointer" style={{ borderLeft: `${isOpen ? 5 : 4}px solid ${accent}` }} onClick={() => toggle(i)}>
                <div className="px-5 py-5 sm:px-6 sm:py-5">
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-[15px] sm:text-base font-semibold text-black select-none">{faq.question}</span>
                    <span className="flex-shrink-0 text-[20px] font-light select-none leading-none" style={{ color: accent }}>{isOpen ? "−" : "+"}</span>
                  </div>
                  <div className="overflow-hidden transition-all duration-200" style={{ maxHeight: isOpen ? "600px" : "0px", opacity: isOpen ? 1 : 0 }}>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-[14px] sm:text-[15px] text-gray-500 leading-[1.6]">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
