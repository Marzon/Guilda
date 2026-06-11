import { Coffee, MessageCircle, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { ROUTES } from "@/lib/routes";

export const WaitingMessage = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
        <Coffee className="w-8 h-8 text-purple-600" />
      </div>
      
      <h3 className="text-xl font-bold text-slate-800 mb-2">
        {t("acceleration.waiting.title", "Aguarde o início do programa")}
      </h3>
      
      <p className="text-slate-600 mb-6 max-w-md mx-auto">
        {t("acceleration.waiting.description", 
          "Enquanto isso, use este tempo para se preparar! Complete o checklist acima com seu co-founder e explore os recursos disponíveis."
        )}
      </p>

      <div className="flex flex-wrap justify-center gap-3">
        <Link 
          to={`${ROUTES.tavern}?tab=tavern`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          {t("acceleration.waiting.exploreTavern", "Explorar a Taverna")}
        </Link>
        
        <Link 
          to={ROUTES.blog}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          {t("acceleration.waiting.readBlog", "Ler o Blog")}
        </Link>
      </div>
    </div>
  );
};
