import { FlaskConical, RotateCcw, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBatchManagerAccess } from "@/hooks/useBatchManagerAccess";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface BatchManagerBarProps {
  userId: string;
  cohortId: string;
}

/**
 * Barra de controle para batch managers testarem a jornada de aceleração.
 * Aparece apenas para usuários que são batch managers da turma.
 */
export function BatchManagerBar({ userId, cohortId }: BatchManagerBarProps) {
  const {
    isBatchManager,
    checkingBatchManager,
    hasTestProgress,
    startTestMode,
    resetTestProgress,
  } = useBatchManagerAccess(userId, cohortId);

  // Não mostrar se não é batch manager ou ainda está verificando
  if (checkingBatchManager || !isBatchManager) {
    return null;
  }

  return (
    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-amber-600" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-amber-900 dark:text-amber-100">
                Modo Batch Manager
              </span>
              <Badge variant="outline" className="text-amber-700 border-amber-300 text-xs">
                Teste
              </Badge>
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-300">
              Você pode testar a jornada sem aparecer como membro da turma
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!hasTestProgress ? (
            <Button
              size="sm"
              onClick={() => startTestMode.mutate()}
              disabled={startTestMode.isPending}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Play className="h-4 w-4 mr-1" />
              {startTestMode.isPending ? "Iniciando..." : "Iniciar Teste"}
            </Button>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-amber-300 text-amber-700 hover:bg-amber-100"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Resetar Teste
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Resetar progresso de teste?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Isso irá apagar todas as suas submissões de teste e reiniciar 
                    o progresso do Dia 1. Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => resetTestProgress.mutate()}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    Resetar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </div>
  );
}
