import { useState } from "react";
import { Wrench } from "lucide-react";
import { ToolsDrawer } from "./ToolsDrawer";

export const ToolsQuickFAB = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-[30%] left-4 lg:left-6 z-40 w-12 h-12 bg-slate-900 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-slate-800 hover:scale-110 transition-all duration-200 group"
        aria-label="Ferramentas rápidas"
      >
        <Wrench className="w-5 h-5 group-hover:rotate-12 transition-transform" />
      </button>

      <ToolsDrawer open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
};
