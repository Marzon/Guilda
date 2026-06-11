import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import i18n from "@/i18n";

export function useSignupSurvey() {
  const { data: authData } = useAuth();
  const user = authData?.user;
  const [shouldShowSurvey, setShouldShowSurvey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const checkSurveyStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('signup_source')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        
        // Show survey if signup_source is null
        setShouldShowSurvey(data?.signup_source === null);
      } catch (error) {
        console.error('Error checking survey status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSurveyStatus();
  }, [user]);

  const submitSurvey = async (source: string, otherText?: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          signup_source: source,
          signup_source_other: otherText || null,
        })
        .eq('id', user.id);

      if (error) throw error;

      setShouldShowSurvey(false);
      toast.success(i18n.t("survey.thankYou"));
    } catch (error) {
      console.error('Error submitting survey:', error);
      toast.error(i18n.t("survey.saveError"));
      throw error;
    }
  };

  return {
    shouldShowSurvey,
    isLoading,
    submitSurvey,
  };
}
