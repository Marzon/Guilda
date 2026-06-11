import { useTranslation } from "react-i18next";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import { Users, Handshake, Rocket } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState, useRef } from "react";

// Hook para count-up animation com requestAnimationFrame
function useCountUp(end: number, duration: number = 1500, isVisible: boolean) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (!isVisible || end === 0) {
      if (!isVisible) setCount(0);
      return;
    }
    
    let startTime: number;
    let animationFrame: number;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function (ease-out cubic)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * end));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, isVisible]);
  
  return count;
}

export function MetricsBar() {
  const { t } = useTranslation();
  const { data: stats, isLoading } = usePlatformStats();
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Intersection Observer para detectar quando entra no viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => observer.disconnect();
  }, []);

  const foundersCount = useCountUp(stats?.total_profiles || 0, 1500, isVisible);
  const matchesCount = useCountUp(Math.max(stats?.total_matches || 0, 1083), 1500, isVisible);
  const projectsCount = useCountUp(stats?.total_projects || 0, 1500, isVisible);

  if (isLoading) {
    return (
      <div className="bg-[#FFFBF7] py-6 sm:py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-center items-center gap-6 sm:gap-12">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-8 w-24 sm:w-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const metrics = [
    {
      icon: Users,
      value: foundersCount,
      label: t('landing.metrics.founders', 'Fundadores'),
    },
    {
      icon: Handshake,
      value: matchesCount,
      label: t('landing.metrics.matches', 'Matches'),
    },
    {
      icon: Rocket,
      value: projectsCount,
      label: t('landing.metrics.projects', 'Projetos'),
    },
  ];

  return (
    <div ref={ref} className="bg-[#FFFBF7] py-6 sm:py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-center items-center gap-6 sm:gap-12">
          {metrics.map((metric, index) => (
            <div key={index} className="flex items-center gap-1.5 sm:gap-2">
              <metric.icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#7610DC] flex-shrink-0" />
              <span className="text-lg sm:text-2xl font-bold text-[#7610DC]">
                {metric.value}+
              </span>
              <span className="text-sm text-gray-600">
                {metric.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
