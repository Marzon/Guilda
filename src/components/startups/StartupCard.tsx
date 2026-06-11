import { Link } from "react-router-dom";
import { CheckCircle, Lightbulb, TrendingUp, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { StartupWithRoles } from "@/hooks/useStartupsWithRoles";

interface StartupCardProps {
  project: StartupWithRoles;
  index: number;
}

const cardGradients = [
  "from-indigo-600 to-purple-500",
  "from-blue-500 to-cyan-500",
  "from-pink-500 to-orange-500",
  "from-green-500 to-emerald-500",
  "from-amber-500 to-yellow-500",
  "from-rose-500 to-red-500",
];

const projectEmojis = ["💸", "🩺", "🎨", "🚀", "📊", "🎮", "🛒", "🔐", "📱", "🌍"];

export const StartupCard = ({ project, index }: StartupCardProps) => {
  const getTimeAgo = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: false, locale: ptBR });
    } catch {
      return "";
    }
  };

  const getStatusBadge = (status: "IDEA" | "MVP" | "SCALE" | null) => {
    if (status === "MVP") {
      return (
        <div className="absolute top-0 right-0 bg-green-100 text-green-700 text-[10px] font-bold px-3 py-1 rounded-bl-xl z-10 border-b border-l border-green-200 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          MVP Validado
        </div>
      );
    }
    if (status === "IDEA") {
      return (
        <div className="absolute top-0 right-0 bg-slate-100 text-slate-600 text-[10px] font-bold px-3 py-1 rounded-bl-xl z-10 border-b border-l border-slate-200 flex items-center gap-1">
          <Lightbulb className="w-3 h-3" />
          Ideação
        </div>
      );
    }
    if (status === "SCALE") {
      return (
        <div className="absolute top-0 right-0 bg-purple-100 text-purple-700 text-[10px] font-bold px-3 py-1 rounded-bl-xl z-10 border-b border-l border-purple-200 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          Escalando
        </div>
      );
    }
    return null;
  };

  return (
    <Link
      to={`/startups/${project.slug}`}
      className="group bg-card rounded-xl border border-border hover:border-primary/50 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col relative overflow-hidden cursor-pointer text-left"
    >
      {/* Status Badge */}
      {getStatusBadge(project.status)}
      
      {/* Cover */}
      {project.cover_image_url ? (
        <div className="h-32 relative overflow-hidden">
          <img 
            src={project.cover_image_url} 
            alt={project.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <div className="absolute bottom-0 left-5 w-12 h-12 bg-card rounded-xl shadow-lg translate-y-1/2 flex items-center justify-center overflow-hidden z-10 group-hover:scale-110 transition-transform border-2 border-card">
            <img src={project.cover_image_url} alt="" className="w-full h-full object-cover" />
          </div>
        </div>
      ) : (
        <div className={`h-32 bg-gradient-to-r ${cardGradients[index % cardGradients.length]} p-5 flex items-end relative`}>
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')]"></div>
          <div className="w-12 h-12 bg-card rounded-xl p-2 shadow-lg -mb-10 flex items-center justify-center text-2xl z-10 group-hover:scale-110 transition-transform">
            {projectEmojis[index % projectEmojis.length]}
          </div>
        </div>
      )}
      
      <div className="p-5 pt-8 flex-1 flex flex-col min-w-0">
        <div className="flex justify-between items-start mb-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors truncate">
              {project.title}
            </h3>
            <p className="text-xs text-muted-foreground font-mono">
              por {project.owner?.username || "Unknown"} • Há {getTimeAgo(project.created_at)}
            </p>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {project.description}
        </p>

        {/* Roles preview */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.roles.slice(0, 3).map((role) => (
            <Badge key={role.id} variant="secondary" className="text-xs gap-1">
              <Briefcase className="w-3 h-3 flex-shrink-0" />
              {role.role_name}
            </Badge>
          ))}
          {project.roles.length > 3 && (
            <Badge variant="outline" className="text-xs">+{project.roles.length - 3}</Badge>
          )}
        </div>

        {/* CTA Footer */}
        <div className="mt-auto pt-4 border-t border-border">
          <span className="text-primary font-semibold text-sm group-hover:underline">
            Ver Detalhes →
          </span>
        </div>
      </div>
    </Link>
  );
};
