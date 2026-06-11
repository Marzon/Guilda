import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface BookRead {
  id: string;
  user_id: string;
  book_id: number;
  read_at: string;
}

export const useBookReads = (userId: string | undefined) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  // Fetch all books read by the user
  const { data: booksRead = [], isLoading } = useQuery({
    queryKey: ['book-reads', userId],
    queryFn: async (): Promise<number[]> => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('user_book_reads')
        .select('book_id')
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error fetching book reads:', error);
        return [];
      }
      
      return data?.map(item => item.book_id) || [];
    },
    enabled: !!userId,
    staleTime: 30_000,
  });

  // Toggle book read status
  const toggleBookMutation = useMutation({
    mutationFn: async ({ bookId, isRead }: { bookId: number; isRead: boolean }) => {
      if (!userId) throw new Error('User not authenticated');

      if (isRead) {
        // Remove book read
        const { error } = await supabase
          .from('user_book_reads')
          .delete()
          .eq('user_id', userId)
          .eq('book_id', bookId);
        
        if (error) throw error;
      } else {
        // Add book read
        const { error } = await supabase
          .from('user_book_reads')
          .insert({ user_id: userId, book_id: bookId });
        
        if (error) throw error;
      }
    },
    onMutate: async ({ bookId, isRead }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['book-reads', userId] });
      
      // Snapshot previous value
      const previousBooksRead = queryClient.getQueryData<number[]>(['book-reads', userId]);
      
      // Optimistically update
      queryClient.setQueryData<number[]>(['book-reads', userId], (old = []) => {
        if (isRead) {
          return old.filter(id => id !== bookId);
        } else {
          return [...old, bookId];
        }
      });
      
      return { previousBooksRead };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousBooksRead) {
        queryClient.setQueryData(['book-reads', userId], context.previousBooksRead);
      }
      toast.error(t('knowledgeRoadmap.errors.toggleFailed', 'Erro ao atualizar livro'));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['book-reads', userId] });
    },
  });

  const toggleBook = (bookId: number) => {
    const isRead = booksRead.includes(bookId);
    toggleBookMutation.mutate({ bookId, isRead });
  };

  const isBookRead = (bookId: number) => booksRead.includes(bookId);

  return {
    booksRead,
    isLoading,
    toggleBook,
    isBookRead,
    readCount: booksRead.length,
  };
};
