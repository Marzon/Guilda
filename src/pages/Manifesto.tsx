import { Helmet } from "react-helmet-async";
import { LandingDarkNavbar } from "@/components/landing/LandingDarkNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { useTranslation } from "react-i18next";
import foundersImage from "@/assets/manifesto-founders.jpg";

const Manifesto = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>{t('manifesto.seo.title', 'Manifesto — Por que a Guilda Existe | Comunidade de Co-founders')}</title>
        <meta name="description" content={t('manifesto.seo.description', 'Startups falham por times mal formados. A Guilda existe para resolver o problema mais crítico do ecossistema: a conexão entre Builders e Sellers.')} />
        <link rel="canonical" href="https://www.guilda.app.br/manifesto" />
        <meta property="og:title" content={t('manifesto.seo.title', 'Manifesto — Por que a Guilda Existe')} />
        <meta property="og:description" content={t('manifesto.seo.description', 'Startups falham por times mal formados. A Guilda existe para resolver a conexão entre Builders e Sellers.')} />
        <meta property="og:url" content="https://www.guilda.app.br/manifesto" />
        <meta property="og:image" content="https://api.guilda.app.br/storage/v1/object/public/og-images/og-image.png" />
      </Helmet>

      <LandingDarkNavbar />

      <main className="pt-24 pb-16 px-4">
        {/* Hero */}
        <section className="max-w-3xl mx-auto text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#7610dc] mb-4">
            {t('manifesto.label', 'Nosso Manifesto')}
          </p>
          <h1
            className="text-[1.75rem] sm:text-4xl md:text-6xl font-serif font-thin leading-[0.9] tracking-tight text-black mb-6"
            style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}
          >
            {t('manifesto.title', 'Por que a Guilda existe.')}
          </h1>
          <div className="w-16 h-[2px] bg-[#7610dc] mx-auto" />
        </section>

        {/* Hero image */}
        <section className="max-w-4xl mx-auto mb-16">
          <div className="rounded-2xl lg:rounded-[2rem] overflow-hidden border border-black/10">
            <img
              src={foundersImage}
              alt="Founders colaborando juntos na Guilda"
              className="w-full h-[280px] sm:h-[380px] object-cover"
              loading="eager"
            />
          </div>
        </section>

        {/* Content */}
        <article className="max-w-2xl mx-auto space-y-8">
          <p className="text-lg sm:text-xl leading-relaxed text-gray-500">
            Startups falham por times mal formados. Existimos para resolver o problema mais crítico e mais ignorado do ecossistema: <strong className="text-black">a conexão de talentos</strong>.
          </p>

          <p className="text-lg sm:text-xl leading-relaxed text-gray-500">
            Na Guilda, acreditamos que encontrar o sócio certo não deveria ser tão trabalhoso — e muito menos depender de sorte. Por isso, somos a plataforma de matching profissional que usa algoritmos inteligentes para criar conexões de alta qualidade para founders early-stage que precisam complementar suas habilidades.
          </p>

          <blockquote className="border-l-4 border-[#7610dc] pl-6 py-4 my-10">
            <p
              className="text-xl sm:text-2xl font-serif font-thin italic text-black leading-snug"
              style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}
            >
              "Não somos um app de amizades. Quem entra na Guilda quer construir algo real."
            </p>
          </blockquote>

          <p className="text-lg sm:text-xl leading-relaxed text-gray-500">
            Quem entra na Guilda quer construir algo real, com responsabilidade, em um ambiente que acompanha o ritmo rápido das startups para acelerar decisões. Nosso compromisso é com a <strong className="text-black">ação corajosa</strong> e o empoderamento de founders para que vençam o desafio de formar o time certo.
          </p>

          <p className="text-lg sm:text-xl leading-relaxed text-gray-500">
            Valorizamos a união entre <span className="text-[#7610dc] font-semibold">Builders</span>, <span className="text-[#f97316] font-semibold">Sellers</span>, <span className="text-emerald-500 font-semibold">Starters</span> e <span className="text-blue-500 font-semibold">Investors</span>, pois entendemos que essas diferenças são o que nos torna mais fortes.
          </p>

          <div className="w-8 h-px bg-gray-200 mx-auto my-12" />

          <p className="text-lg sm:text-xl leading-relaxed text-gray-500">
            Somos diretos, sem enrolação, e honestos sobre as dificuldades da jornada. Evitamos a passividade, as promessas vagas e o networking casual. Atuamos como parceiros, não vendedores, focando em transformar sonhos em realidade através de um método que parece mágica, mas é pura visão estratégica.
          </p>

          <p
            className="text-xl sm:text-2xl font-serif font-thin text-center text-black leading-[0.95] mt-12"
            style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}
          >
            Se o objetivo é construir o futuro, a Guilda é o ponto de partida para quem busca urgência, determinação e foco em resultados.
          </p>
        </article>
      </main>

      <FinalCTA />
      <LandingFooter />
    </div>
  );
};

export default Manifesto;
