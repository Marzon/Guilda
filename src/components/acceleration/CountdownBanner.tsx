import { useState, useEffect } from "react";
import { Clock, Calendar, Flame } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { motion } from "framer-motion";
import { formatInSaoPaulo, toSaoPauloTime, getCurrentSaoPauloDate } from "@/lib/timezone";

interface CountdownBannerProps {
  startDate: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const CountdownBanner = ({ startDate }: CountdownBannerProps) => {
  const { t, currentLanguage } = useLanguage();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      // Parse start date in São Paulo timezone (dates from DB like "2026-02-02" should be treated as São Paulo midnight)
      // We need to treat the date string as São Paulo local date, not UTC
      const [year, month, day] = startDate.split('-').map(Number);
      const startInSaoPaulo = new Date(year, month - 1, day, 0, 0, 0); // Local date interpretation
      const saoPauloStart = toSaoPauloTime(startInSaoPaulo);
      
      const now = getCurrentSaoPauloDate();
      const difference = saoPauloStart.getTime() - now.getTime();

      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [startDate]);

  // Format the date correctly in São Paulo timezone
  // Parse as local date first to avoid timezone offset issues
  const [year, month, day] = startDate.split('-').map(Number);
  const dateForDisplay = new Date(year, month - 1, day);
  const formattedDate = formatInSaoPaulo(dateForDisplay, "EEEE, d 'de' MMMM 'de' yyyy", currentLanguage);

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <motion.div 
      className="flex flex-col items-center"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 min-w-[70px] border border-white/10 shadow-lg">
        <span className="text-3xl sm:text-4xl font-black tabular-nums tracking-tight">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-xs sm:text-sm mt-2 opacity-90 font-medium uppercase tracking-wide">{label}</span>
    </motion.div>
  );

  return (
    <motion.div 
      className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-accent rounded-2xl p-6 sm:p-8 text-white shadow-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <Flame className="w-6 h-6" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold">
            {t("acceleration.countdown.title", "O programa começa em")}
          </h3>
        </div>

        {/* Countdown */}
        <div className="flex justify-center items-center gap-2 sm:gap-4 mb-6">
          <TimeBlock 
            value={timeLeft.days} 
            label={t("acceleration.countdown.days", "dias")} 
          />
          <span className="text-3xl sm:text-4xl font-bold self-start mt-3 opacity-60">:</span>
          <TimeBlock 
            value={timeLeft.hours} 
            label={t("acceleration.countdown.hours", "horas")} 
          />
          <span className="text-3xl sm:text-4xl font-bold self-start mt-3 opacity-60">:</span>
          <TimeBlock 
            value={timeLeft.minutes} 
            label={t("acceleration.countdown.minutes", "min")} 
          />
          <span className="text-3xl sm:text-4xl font-bold self-start mt-3 opacity-60 hidden sm:block">:</span>
          <div className="hidden sm:block">
            <TimeBlock 
              value={timeLeft.seconds} 
              label={t("acceleration.countdown.seconds", "seg")} 
            />
          </div>
        </div>

        {/* Start Date */}
        <div className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mx-auto w-fit">
          <Calendar className="w-4 h-4" />
          <span className="text-sm sm:text-base capitalize font-medium">
            {t("acceleration.countdown.startDate", "Data de Início:")} {formattedDate}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
