import { useEffect, useRef } from "react";
import { Swords } from "lucide-react";
import { CORE_APP_URL } from "@/lib/constants";
import { buildCoreAppUrl } from "@/lib/url-utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "react-i18next";

export const HeroSection = () => {
  const signupUrl = buildCoreAppUrl(CORE_APP_URL, "/auth?view=signup");
  const isMobile = useIsMobile();
  const sectionRef = useRef<HTMLElement>(null);
  const desktopVideoRef = useRef<HTMLVideoElement>(null);
  const mobileVideoRef = useRef<HTMLVideoElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const videos = [desktopVideoRef.current, mobileVideoRef.current];
    videos.forEach((video) => {
      if (!video) return;
      video.play().catch(() => {
        video.style.display = "none";
        const parent = video.parentElement;
        if (parent && video.poster) {
          parent.style.backgroundImage = `url(${video.poster})`;
          parent.style.backgroundSize = "cover";
          parent.style.backgroundPosition = "center";
        }
      });
    });
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full overflow-hidden bg-white">
      {/* Desktop video */}
      <div className="hidden md:block relative w-full h-[calc(100vh-56px)] bg-cover bg-[center_top]" style={{ backgroundImage: 'url(/hero-poster.jpg)' }}>
        <video
          ref={desktopVideoRef}
          autoPlay muted loop playsInline preload="metadata"
          poster="/hero-poster.jpg"
          className="w-full h-full object-cover object-[center_top]"
        >
          <source src="/hero-video-clean.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Mobile video */}
      <video
        ref={mobileVideoRef}
        autoPlay muted loop playsInline preload="metadata"
        poster="/hero-poster-mobile.jpg"
        // @ts-ignore fetchPriority not yet in React types
        fetchPriority="high"
        className="block md:hidden w-full h-auto"
      >
        <source src="/hero-video-mobile-clean.mp4" type="video/mp4" />
      </video>

      {/* Text overlay */}
      <div
        className="absolute inset-0 z-10 flex flex-col items-center text-center
          max-md:justify-start max-md:pt-[max(72px,15vh)] max-md:px-6 max-md:gap-2
          md:justify-start md:pt-[20vh] md:items-center md:px-10"
      >
        <h2
          className="hero-anim-slide-up font-serif font-thin leading-[0.9] tracking-tight mb-1 md:mb-2 text-white
            max-md:text-[1.75rem]
            md:[font-size:clamp(40px,6vw,90px)]"
          style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}
        >
          {t('landing.hero.videoTitle')}
        </h2>

        <p
          className="hero-anim-slide-up hero-delay-1 font-normal uppercase text-white/90
            max-md:text-[18px] max-md:leading-[1.3] max-md:tracking-[1px] max-md:mb-2
            md:mb-6 md:tracking-[2px] md:[font-size:clamp(20px,3.5vw,54px)]"
        >
          {t('landing.hero.videoSubtitle')}
        </p>

        {/* Desktop CTA */}
        <a
          href={signupUrl}
          className="hero-anim-fade-in hero-delay-4 hidden md:inline-block
            min-w-[280px] px-8 py-4 text-lg text-center
            bg-[#F97316] hover:bg-[#F97316]/90 text-white font-bold rounded-xl
            no-underline transition-colors duration-300 md:mb-6"
        >
          {t('landing.hero.videoCta')} →
        </a>

        {/* Badges */}
        <div className="flex items-center justify-center max-md:gap-2 max-md:mb-0 md:mb-0 md:[gap:clamp(12px,2vw,24px)]">
          <span className="hero-anim-slide-right italic text-white font-serif max-md:text-[18px] md:[font-size:clamp(23px,3.1vw,47px)]">
            sellers
          </span>
          <Swords className="hero-anim-drop-down text-white max-md:w-[18px] max-md:h-[18px] md:[width:clamp(20px,2.7vw,42px)] md:[height:clamp(20px,2.7vw,42px)]" />
          <span className="hero-anim-slide-left text-white font-mono max-md:text-[16px] md:[font-size:clamp(20px,2.8vw,43px)]">
            builders
          </span>
        </div>

        {/* Mobile CTA */}
        <a
          href={signupUrl}
          className="hero-anim-fade-in hero-delay-4 md:hidden
            mt-4 self-center
            bg-[#F97316] hover:bg-[#F97316]/90 text-white font-bold rounded-xl
            no-underline transition-colors duration-300
            px-5 py-2 text-[12px]"
        >
          {t('landing.hero.videoCta')}
        </a>
      </div>

      {/* SEO-only text */}
      <div className="sr-only">
        <h1>{t('landing.hero.seoH1')}</h1>
        <p>{t('landing.hero.seoDescription')}</p>
      </div>
    </section>
  );
};
