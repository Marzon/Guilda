import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CanonBook } from '@/data/canon-books';

interface BookCover {
  isbn: string;
  cover_url: string;
  loading: boolean;
  error: boolean;
}

// In-memory cache to avoid re-fetching
const coverCache = new Map<string, string>();
const pendingGenerations = new Set<string>();

export function useBookCovers(books: CanonBook[]) {
  const [covers, setCovers] = useState<Map<string, BookCover>>(new Map());

  // Initialize with cached covers
  useEffect(() => {
    const initialCovers = new Map<string, BookCover>();
    books.forEach(book => {
      const cached = coverCache.get(book.isbn);
      initialCovers.set(book.isbn, {
        isbn: book.isbn,
        cover_url: cached || '',
        loading: !cached,
        error: false
      });
    });
    setCovers(initialCovers);
  }, [books]);

  // Fetch existing covers from database
  useEffect(() => {
    const fetchExistingCovers = async () => {
      const isbns = books.map(b => b.isbn).filter(isbn => !coverCache.has(isbn));
      
      if (isbns.length === 0) return;

      try {
        const { data, error } = await supabase
          .from('book_covers')
          .select('isbn, cover_url')
          .in('isbn', isbns);

        if (error) {
          console.error('Error fetching covers:', error);
          return;
        }

        if (data && data.length > 0) {
          setCovers(prev => {
            const updated = new Map(prev);
            data.forEach(cover => {
              coverCache.set(cover.isbn, cover.cover_url);
              updated.set(cover.isbn, {
                isbn: cover.isbn,
                cover_url: cover.cover_url,
                loading: false,
                error: false
              });
            });
            return updated;
          });
        }
      } catch (err) {
        console.error('Failed to fetch covers:', err);
      }
    };

    fetchExistingCovers();
  }, [books]);

  // Generate a single cover
  const generateCover = useCallback(async (book: CanonBook): Promise<string | null> => {
    if (coverCache.has(book.isbn)) {
      return coverCache.get(book.isbn)!;
    }

    if (pendingGenerations.has(book.isbn)) {
      return null;
    }

    pendingGenerations.add(book.isbn);

    setCovers(prev => {
      const updated = new Map(prev);
      updated.set(book.isbn, {
        isbn: book.isbn,
        cover_url: '',
        loading: true,
        error: false
      });
      return updated;
    });

    try {
      const response = await supabase.functions.invoke('generate-book-cover', {
        body: {
          isbn: book.isbn,
          title: book.title,
          author: book.author,
          category: book.category,
          stage: book.critical_for_stage
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const { cover_url } = response.data;
      
      if (cover_url) {
        coverCache.set(book.isbn, cover_url);
        
        setCovers(prev => {
          const updated = new Map(prev);
          updated.set(book.isbn, {
            isbn: book.isbn,
            cover_url,
            loading: false,
            error: false
          });
          return updated;
        });

        return cover_url;
      }

      throw new Error('No cover URL returned');
    } catch (err) {
      console.error(`Failed to generate cover for ${book.isbn}:`, err);
      
      setCovers(prev => {
        const updated = new Map(prev);
        updated.set(book.isbn, {
          isbn: book.isbn,
          cover_url: '',
          loading: false,
          error: true
        });
        return updated;
      });

      return null;
    } finally {
      pendingGenerations.delete(book.isbn);
    }
  }, []);

  // Get cover state for a specific book
  const getCoverState = useCallback((isbn: string): BookCover => {
    return covers.get(isbn) || {
      isbn,
      cover_url: '',
      loading: false,
      error: false
    };
  }, [covers]);

  return {
    covers,
    generateCover,
    getCoverState
  };
}

// Hook for a single book cover
export function useBookCover(book: CanonBook | null) {
  const [coverUrl, setCoverUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!book) return;

    // Check cache first
    const cached = coverCache.get(book.isbn);
    if (cached) {
      setCoverUrl(cached);
      return;
    }

    // Check database
    const checkDatabase = async () => {
      try {
        const { data } = await supabase
          .from('book_covers')
          .select('cover_url')
          .eq('isbn', book.isbn)
          .maybeSingle();

        if (data?.cover_url) {
          coverCache.set(book.isbn, data.cover_url);
          setCoverUrl(data.cover_url);
        }
      } catch (err) {
        // No cover exists yet - this is expected
        console.log(`No cover found for ${book.isbn}`);
      }
    };

    checkDatabase();
  }, [book]);

  const generate = useCallback(async () => {
    if (!book || loading || pendingGenerations.has(book.isbn)) return;

    pendingGenerations.add(book.isbn);
    setLoading(true);
    setError(false);

    try {
      const response = await supabase.functions.invoke('generate-book-cover', {
        body: {
          isbn: book.isbn,
          title: book.title,
          author: book.author,
          category: book.category,
          stage: book.critical_for_stage
        }
      });

      if (response.error) throw response.error;

      const { cover_url } = response.data;
      if (cover_url) {
        coverCache.set(book.isbn, cover_url);
        setCoverUrl(cover_url);
      } else {
        throw new Error('No cover URL');
      }
    } catch (err) {
      console.error('Generate cover error:', err);
      setError(true);
    } finally {
      setLoading(false);
      pendingGenerations.delete(book.isbn);
    }
  }, [book, loading]);

  return { coverUrl, loading, error, generate };
}
